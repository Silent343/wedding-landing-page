import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT || "4173", 10);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "").replace(/\/$/, "");
const TRUST_PROXY = process.env.TRUST_PROXY === "true";
const RATE_WINDOW = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);
const RATE_MAX = Number.parseInt(process.env.RATE_LIMIT_MAX || "5", 10);
const MAX_BODY_BYTES = 16 * 1024;

if (IS_PRODUCTION && (!SITE_ORIGIN || !SITE_ORIGIN.startsWith("https://"))) {
  console.error("SITE_ORIGIN debe ser un origen HTTPS válido en producción.");
  process.exit(1);
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"], [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"], [".xml", "application/xml; charset=utf-8"],
  [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"],
  [".webp", "image/webp"], [".svg", "image/svg+xml"], [".ico", "image/x-icon"],
  [".mp4", "video/mp4"], [".webm", "video/webm"]
]);

const rateBuckets = new Map();
const json = (res, status, payload, headers = {}) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store", ...headers });
  res.end(body);
};

const setSecurityHeaders = (res) => {
  const csp = [
    "default-src 'self'", "base-uri 'self'", "frame-ancestors 'none'", "object-src 'none'",
    "script-src 'self'", "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data:",
    "media-src 'self'", "connect-src 'self'", "form-action 'self'"
  ];
  if (IS_PRODUCTION) csp.push("upgrade-insecure-requests");
  res.setHeader("Content-Security-Policy", csp.join("; "));
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  if (IS_PRODUCTION) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
};

const clientIp = (req) => {
  if (TRUST_PROXY) return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
  return req.socket.remoteAddress || "unknown";
};

const checkRateLimit = (req) => {
  const key = crypto.createHash("sha256").update(clientIp(req)).digest("hex");
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + RATE_WINDOW };
    rateBuckets.set(key, bucket);
    return { allowed: true, remaining: RATE_MAX - 1, resetAt: bucket.resetAt };
  }
  current.count += 1;
  return { allowed: current.count <= RATE_MAX, remaining: Math.max(0, RATE_MAX - current.count), resetAt: current.resetAt };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateBuckets) if (value.resetAt <= now) rateBuckets.delete(key);
}, RATE_WINDOW).unref();

const parseCookies = (req) => Object.fromEntries(
  String(req.headers.cookie || "").split(";").map((item) => item.trim()).filter(Boolean).map((item) => {
    const index = item.indexOf("=");
    return index > -1 ? [item.slice(0, index), decodeURIComponent(item.slice(index + 1))] : [item, ""];
  })
);

const sameToken = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length || a.length < 32) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

const expectedOrigin = (req) => SITE_ORIGIN || `${req.socket.encrypted ? "https" : "http"}://${req.headers.host}`;
const originAllowed = (req) => typeof req.headers.origin === "string" && req.headers.origin === expectedOrigin(req);

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let received = 0;
  let tooLarge = false;
  const chunks = [];
  req.on("data", (chunk) => {
    received += chunk.length;
    if (received > MAX_BODY_BYTES && !tooLarge) {
      tooLarge = true;
      reject(Object.assign(new Error("BODY_TOO_LARGE"), { status: 413 }));
      return;
    }
    if (!tooLarge) chunks.push(chunk);
  });
  req.on("end", () => {
    if (tooLarge) return;
    try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
    catch { reject(Object.assign(new Error("INVALID_JSON"), { status: 400 })); }
  });
  req.on("error", reject);
});

const cleanText = (value) => String(value ?? "").normalize("NFC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
const escapeHtml = (value) => cleanText(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);

const validateContact = (body) => {
  const data = {
    name: cleanText(body.name), phone: cleanText(body.phone), email: cleanText(body.email).toLowerCase(),
    date: cleanText(body.date), message: cleanText(body.message), consent: body.consent === true,
    website: cleanText(body.website), startedAt: Number(body.startedAt)
  };
  const fields = {};
  if (!/^[\p{L}\p{M}][\p{L}\p{M}'’ .-]{1,79}$/u.test(data.name)) fields.name = "Escribe un nombre válido de 2 a 80 caracteres.";
  if (!/^\+?[0-9()\s-]{7,20}$/.test(data.phone)) fields.phone = "Escribe un número de celular válido.";
  if (data.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(data.email)) fields.email = "Escribe un correo válido, por ejemplo nombre@dominio.com.";
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) fields.date = "Selecciona una fecha válida.";
  if (data.message.length < 20 || data.message.length > 1200) fields.message = "Cuéntanos un poco más: entre 20 y 1200 caracteres.";
  if (!data.consent) fields.consent = "Necesitamos tu autorización para responder la consulta.";
  if (data.website) fields.form = "No pudimos validar el formulario.";
  if (!Number.isFinite(data.startedAt) || Date.now() - data.startedAt < 2000 || Date.now() - data.startedAt > 7_200_000) fields.form = "Actualiza la página e inténtalo nuevamente.";
  return { data, fields, valid: Object.keys(fields).length === 0 };
};

const sendWithResend = async (data, requestId) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.CONTACT_TO;
  if (!apiKey || !from || !to) throw Object.assign(new Error("MAIL_NOT_CONFIGURED"), { publicStatus: 503 });

  const text = [
    "Nueva consulta desde la landing de ÉLITE Event's Iquitos", "",
    `Nombre: ${data.name}`, `Celular: ${data.phone}`, `Email: ${data.email}`,
    `Fecha estimada: ${data.date || "Sin definir"}`, "", data.message, "", `ID: ${requestId}`
  ].join("\n");
  const html = `<h2>Nueva consulta</h2><p><strong>Nombre:</strong> ${escapeHtml(data.name)}</p><p><strong>Celular:</strong> ${escapeHtml(data.phone)}</p><p><strong>Email:</strong> ${escapeHtml(data.email)}</p><p><strong>Fecha estimada:</strong> ${escapeHtml(data.date || "Sin definir")}</p><p><strong>Mensaje:</strong></p><p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p><hr><small>ID: ${requestId}</small>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": requestId },
    body: JSON.stringify({ from, to: [to], reply_to: data.email, subject: "Nueva consulta — ÉLITE Event's Iquitos", text, html }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw Object.assign(new Error("MAIL_PROVIDER_ERROR"), { publicStatus: 502, providerStatus: response.status });
};

const handleCsrf = (req, res) => {
  const token = crypto.randomBytes(32).toString("base64url");
  const cookie = [`elite_csrf=${encodeURIComponent(token)}`, "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=3600"];
  if (IS_PRODUCTION) cookie.push("Secure");
  res.setHeader("Set-Cookie", cookie.join("; "));
  json(res, 200, { token });
};

const handleContact = async (req, res) => {
  if (req.headers["content-type"]?.split(";")[0] !== "application/json") return json(res, 415, { ok: false, message: "Formato de solicitud no admitido." });
  if (!originAllowed(req)) return json(res, 403, { ok: false, message: "Origen de solicitud no autorizado." });
  const csrfCookie = parseCookies(req).elite_csrf;
  if (!sameToken(csrfCookie, req.headers["x-csrf-token"])) return json(res, 403, { ok: false, code: "CSRF", message: "La sesión del formulario expiró. Actualiza la página." });

  const rate = checkRateLimit(req);
  const rateHeaders = { "RateLimit-Limit": String(RATE_MAX), "RateLimit-Remaining": String(rate.remaining), "RateLimit-Reset": String(Math.ceil(rate.resetAt / 1000)) };
  if (!rate.allowed) return json(res, 429, { ok: false, code: "RATE_LIMIT", message: "Recibimos varios intentos. Espera unos minutos antes de volver a enviar." }, { ...rateHeaders, "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)) });

  try {
    const body = await readJsonBody(req);
    const result = validateContact(body);
    if (!result.valid) return json(res, 422, { ok: false, code: "VALIDATION", message: "Revisa los campos señalados.", fields: result.fields }, rateHeaders);
    const requestId = crypto.randomUUID();
    await sendWithResend(result.data, requestId);
    console.info(JSON.stringify({ event: "contact_sent", requestId, at: new Date().toISOString() }));
    return json(res, 200, { ok: true, message: "Gracias. Recibimos tu consulta y te responderemos pronto." }, rateHeaders);
  } catch (error) {
    const status = error.status || error.publicStatus || 500;
    console.error(JSON.stringify({ event: "contact_error", type: error.message, providerStatus: error.providerStatus, at: new Date().toISOString() }));
    const publicMessage = status === 413
      ? "La solicitud es demasiado grande. Reduce el mensaje e inténtalo nuevamente."
      : status === 503
        ? "El envío aún no está configurado. Inténtalo más tarde."
        : "No pudimos enviar tu consulta. Inténtalo nuevamente.";
    if (!res.headersSent) return json(res, status, { ok: false, message: publicMessage }, rateHeaders);
  }
};

const allowedStaticPath = (pathname) => {
  if (pathname === "/") return path.join(ROOT, "index.html");
  if (["/style.css", "/main.js", "/robots.txt", "/privacidad.html", "/terminos.html"].includes(pathname)) return path.join(ROOT, pathname.slice(1));
  if (!pathname.startsWith("/assets/")) return null;
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes("\0") || decoded.split("/").includes("..")) return null;
  const resolved = path.resolve(ROOT, `.${decoded}`);
  return resolved.toLowerCase().startsWith(path.join(ROOT, "assets").toLowerCase() + path.sep) ? resolved : null;
};

const serveFile = (req, res, pathname) => {
  const filePath = allowedStaticPath(pathname);
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return json(res, 404, { ok: false, message: "Recurso no encontrado." });
  const stat = fs.statSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  if (!mimeTypes.has(extension)) return json(res, 404, { ok: false, message: "Recurso no encontrado." });
  const type = mimeTypes.get(extension);
  const range = req.headers.range;
  res.setHeader("Content-Type", type);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", pathname.startsWith("/assets/") ? "public, max-age=86400" : "no-cache");

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) { res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }); return res.end(); }
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : stat.size - 1;
    if (start > end || end >= stat.size) { res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }); return res.end(); }
    res.writeHead(206, { "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": end - start + 1 });
    if (req.method === "HEAD") return res.end();
    return fs.createReadStream(filePath, { start, end }).pipe(res);
  }

  res.writeHead(200, { "Content-Length": stat.size });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api/health" && req.method === "GET") return json(res, 200, { ok: true });
  if (url.pathname === "/api/csrf" && req.method === "GET") return handleCsrf(req, res);
  if (url.pathname === "/api/contact" && req.method === "POST") return handleContact(req, res);
  if (url.pathname.startsWith("/api/")) return json(res, 405, { ok: false, message: "Método no permitido." }, { Allow: url.pathname === "/api/contact" ? "POST" : "GET" });
  if (!["GET", "HEAD"].includes(req.method)) return json(res, 405, { ok: false, message: "Método no permitido." }, { Allow: "GET, HEAD" });
  return serveFile(req, res, url.pathname);
});

server.headersTimeout = 10_000;
server.requestTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.maxRequestsPerSocket = 100;
server.maxHeadersCount = 50;

server.listen(PORT, HOST, () => {
  console.info(`ÉLITE landing disponible en http://${HOST}:${PORT}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
