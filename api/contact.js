import { createHash } from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 16 * 1024;
const rateLimitStore = globalThis.__eliteContactRateLimit ?? new Map();
globalThis.__eliteContactRateLimit = rateLimitStore;

const setSecurityHeaders = (res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
};

const sendJson = (res, status, payload) => {
  setSecurityHeaders(res);
  return res.status(status).json(payload);
};

const getRequestOrigin = (req) => {
  const protocol = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${protocol}://${host}` : "";
};

const getAllowedOrigins = (req) => {
  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const currentOrigin = getRequestOrigin(req);
  if (currentOrigin) configured.push(currentOrigin);
  return new Set(configured);
};

const isSameOriginRequest = (req) => {
  const origin = String(req.headers.origin || "").replace(/\/$/, "");
  const fetchSite = String(req.headers["sec-fetch-site"] || "");
  if (fetchSite && !["same-origin", "same-site"].includes(fetchSite)) return false;
  if (!origin) return process.env.NODE_ENV !== "production";
  return getAllowedOrigins(req).has(origin);
};

const getIp = (req) => {
  const forwarded = String(req.headers["x-forwarded-for"] || "");
  return forwarded.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
};

const getRateLimitKey = (req) => {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.RESEND_API_KEY || "local-development";
  return createHash("sha256").update(`${secret}:${getIp(req)}`).digest("hex");
};

const consumeRateLimit = (req) => {
  const now = Date.now();
  if (rateLimitStore.size > 2000) {
    for (const [storedKey, value] of rateLimitStore) {
      if (value.resetAt <= now) rateLimitStore.delete(storedKey);
    }
  }
  const key = getRateLimitKey(req);
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
};

const parseBody = (req) => {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    if (Array.isArray(req.body)) throw new SyntaxError("Body must be an object");
    if (Buffer.byteLength(JSON.stringify(req.body), "utf8") > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
    return req.body;
  }
  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body || "");
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  return raw ? JSON.parse(raw) : {};
};

const normalizeSingleLine = (value, maxLength) => String(value ?? "")
  .replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, maxLength);

const normalizeMessage = (value, maxLength) => String(value ?? "")
  .replace(/\r\n?/g, "\n")
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
  .trim()
  .slice(0, maxLength);

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
})[character]);

const validatePayload = (body) => {
  const data = {
    name: normalizeSingleLine(body.name, 80),
    phone: normalizeSingleLine(body.phone, 20),
    email: normalizeSingleLine(body.email, 120).toLowerCase(),
    date: normalizeSingleLine(body.date || body.eventDate, 10),
    message: normalizeMessage(body.message, 1200),
    website: normalizeSingleLine(body.website, 200),
    consent: body.consent === true || body.consent === "true" || body.consent === "on" || body.consent === 1,
  };

  const errors = {};
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]{1,79}$/u.test(data.name)) errors.name = "Ingresa un nombre válido.";
  if (!/^\+?[0-9\s()-]{7,20}$/.test(data.phone) || data.phone.replace(/\D/g, "").length < 7) errors.phone = "Ingresa un celular válido.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(data.email)) errors.email = "Ingresa un correo válido.";
  if (data.date) {
    const parsedDate = new Date(`${data.date}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== data.date) {
      errors.date = "Selecciona una fecha válida.";
    }
  }
  if (data.message.length < 20) errors.message = "Cuéntanos un poco más sobre tu celebración.";
  if (!data.consent) errors.consent = "Debes aceptar el uso de tus datos para responderte.";

  return { data, errors };
};

const buildEmail = (data) => {
  const safe = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, escapeHtml(value)]));
  const dateLabel = safe.date || "Por definir";
  return {
    subject: `Nueva consulta de ${data.name}`,
    text: [
      "Nueva consulta desde eliteeventsiquitos.com",
      "",
      `Nombre: ${data.name}`,
      `Celular: ${data.phone}`,
      `Email: ${data.email}`,
      `Fecha estimada: ${data.date || "Por definir"}`,
      "",
      "Mensaje:",
      data.message,
    ].join("\n"),
    html: `<!doctype html><html><body style="margin:0;background:#f8f3ec;font-family:Arial,sans-serif;color:#201b18"><div style="max-width:640px;margin:0 auto;padding:32px"><div style="background:#fffdf9;border:1px solid #e4d9ce;padding:32px"><p style="margin:0 0 8px;color:#643c3d;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">ÉLITE Event's Iquitos</p><h1 style="margin:0 0 28px;font-size:28px;font-weight:500">Nueva consulta</h1><table style="width:100%;border-collapse:collapse;font-size:15px"><tr><td style="padding:9px 0;color:#675e57">Nombre</td><td style="padding:9px 0;text-align:right">${safe.name}</td></tr><tr><td style="padding:9px 0;color:#675e57">Celular</td><td style="padding:9px 0;text-align:right">${safe.phone}</td></tr><tr><td style="padding:9px 0;color:#675e57">Email</td><td style="padding:9px 0;text-align:right">${safe.email}</td></tr><tr><td style="padding:9px 0;color:#675e57">Fecha</td><td style="padding:9px 0;text-align:right">${dateLabel}</td></tr></table><div style="margin-top:24px;padding:20px;background:#f3ebe2;white-space:pre-wrap;line-height:1.65">${safe.message}</div></div></div></body></html>`,
  };
};

const sendWithResend = async (data) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO;
  if (!apiKey || !from || !to) throw new Error("EMAIL_NOT_CONFIGURED");

  const email = buildEmail(data);
  const idempotencyKey = createHash("sha256")
    .update(`${data.email}:${data.phone}:${data.date}:${data.message}:${Math.floor(Date.now() / WINDOW_MS)}`)
    .digest("hex");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact-${idempotencyKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: data.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend rejected the contact email", response.status, errorBody.slice(0, 500));
    throw new Error("EMAIL_DELIVERY_FAILED");
  }
};

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { ok: false, message: "Método no permitido." });
  }

  if (!isSameOriginRequest(req)) {
    return sendJson(res, 403, { ok: false, message: "La solicitud no es válida." });
  }

  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return sendJson(res, 415, { ok: false, message: "Formato de solicitud no admitido." });
  }

  const declaredLength = Number(req.headers["content-length"] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return sendJson(res, 413, { ok: false, message: "La consulta es demasiado extensa." });
  }

  const limit = consumeRateLimit(req);
  res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return sendJson(res, 429, { ok: false, message: "Has enviado varias consultas. Inténtalo nuevamente en unos minutos." });
  }

  try {
    const body = parseBody(req);
    const { data, errors } = validatePayload(body);

    if (data.website) {
      return sendJson(res, 200, { ok: true, message: "Gracias. Recibimos tu consulta." });
    }

    if (Object.keys(errors).length) {
      return sendJson(res, 422, { ok: false, message: "Revisa los campos indicados.", errors });
    }

    await sendWithResend(data);
    return sendJson(res, 200, { ok: true, message: "Gracias. Recibimos tu consulta y te responderemos pronto." });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return sendJson(res, 400, { ok: false, message: "No pudimos leer la solicitud." });
    }
    if (error?.message === "PAYLOAD_TOO_LARGE") {
      return sendJson(res, 413, { ok: false, message: "La consulta es demasiado extensa." });
    }
    if (error?.message === "EMAIL_NOT_CONFIGURED") {
      console.error("Missing Resend environment variables");
      return sendJson(res, 503, { ok: false, message: "El formulario está en configuración. Escríbenos directamente por correo." });
    }
    console.error("Contact form error", error);
    return sendJson(res, 502, { ok: false, message: "No pudimos enviar tu consulta. Inténtalo nuevamente o escríbenos por correo." });
  }
}
