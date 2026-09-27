import { createHmac, randomBytes } from "node:crypto";

const TOKEN_TTL_SECONDS = 60 * 60;
const COOKIE_NAME = "elite_csrf";

const getSecret = () => process.env.CSRF_SECRET || process.env.RATE_LIMIT_SECRET || process.env.RESEND_API_KEY;

const createToken = (secret) => {
  const nonce = randomBytes(24).toString("base64url");
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${nonce}.${issuedAt}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const getCurrentOrigin = (req) => {
  const protocol = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${protocol}://${host}` : "";
};

const isAllowedRequest = (req) => {
  const fetchSite = String(req.headers["sec-fetch-site"] || "");
  if (fetchSite && !["same-origin", "same-site"].includes(fetchSite)) return false;

  const origin = String(req.headers.origin || "").replace(/\/$/, "");
  if (!origin) return true;

  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const currentOrigin = getCurrentOrigin(req);
  return origin === currentOrigin || configured.includes(origin);
};

const sendJson = (res, status, payload) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(payload);
};

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, message: "Método no permitido." });
  }

  if (!isAllowedRequest(req)) {
    return sendJson(res, 403, { ok: false, message: "La solicitud no es válida." });
  }

  const secret = getSecret();
  if (!secret) {
    console.error("Missing CSRF_SECRET, RATE_LIMIT_SECRET or RESEND_API_KEY");
    return sendJson(res, 503, { ok: false, message: "El formulario está en configuración." });
  }

  const token = createToken(secret);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TOKEN_TTL_SECONDS}${secure}`);
  return sendJson(res, 200, { ok: true, csrfToken: token, token });
}
