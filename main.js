const asset = (name) => `assets/${name}`;

const portfolioMedia = [
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.34.13 PM.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.34.11 PM.webp") },
  { type: "video", src: asset("b.mp4") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.35.41 PMb.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.34.14 PM.webp") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.34.08 PM.mp4") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.21.37 PM.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.35.41 PMa.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.35.42 PMa.webp") },
  { type: "video", src: asset("gg.mp4") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.36.17 PMc.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.36.38 PM.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.34.12 PM.webp") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.35.35 PM.mp4") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.35.37 PM.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.35.41 PM.webp") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.35.40 PM.mp4") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.35.41 PMg.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.36.17 PMa.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.36.55 PM.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.38.05 PM.webp") },
  { type: "image", src: asset("WhatsApp Image 2026-09-17 at 11.35.37 PMd.webp") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.35.47 PMx.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.35.54 PMf.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.01 PMa.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.02 PMg.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.03 PMs.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.10 PMf.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.13 PMs.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.16 PMa.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.29 PMx.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.32 PMs.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.37 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.49 PMf.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.52 PMa.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.36.57 PMx.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.37.11 PMggg.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.37.16 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.37.19 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.37.21 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.37.23 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.37.26 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.37.59 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.38.02 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.38.04 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.38.09 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.38.16 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.42.00 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.42.08 PM.mp4") },
  { type: "video", src: asset("WhatsApp Video 2026-09-17 at 11.47.58 PM.mp4") }
];

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

const setMenu = (open) => {
  menuButton?.classList.toggle("is-open", open);
  nav?.classList.toggle("is-open", open);
  menuButton?.setAttribute("aria-expanded", String(open));
};

menuButton?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", window.scrollY > 12), { passive: true });

const grid = document.querySelector("#media-grid");
const loadMoreButton = document.querySelector("#load-more");
const filters = document.querySelectorAll(".filter-button");
const lightbox = document.querySelector("#lightbox");
const lightboxStage = document.querySelector("#lightbox-stage");
const lightboxType = document.querySelector("#lightbox-type");
const lightboxClose = document.querySelector(".lightbox-close");

let activeFilter = "all";
let visibleLimit = 12;

const filteredMedia = () => activeFilter === "all"
  ? portfolioMedia
  : portfolioMedia.filter((item) => item.type === activeFilter);

const mediaNode = (item, index) => {
  const card = document.createElement("button");
  card.className = "media-card";
  card.type = "button";
  card.dataset.index = String(portfolioMedia.indexOf(item));
  card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;
  card.setAttribute("aria-label", `Abrir ${item.type === "video" ? "video" : "fotografía"} de una celebración en Iquitos, Perú`);

  let media;
  if (item.type === "image") {
    media = document.createElement("img");
    media.src = item.src;
    media.alt = "Celebración en Iquitos, Perú";
    media.loading = "lazy";
    media.decoding = "async";
  } else {
    media = document.createElement("video");
    media.src = item.src;
    media.muted = true;
    media.playsInline = true;
    media.preload = "metadata";
    media.setAttribute("aria-hidden", "true");
    const badge = document.createElement("span");
    badge.className = "video-badge";
    badge.textContent = "Video";
    card.append(badge);
  }

  const overlay = document.createElement("span");
  overlay.className = "media-card-overlay";
  const meta = document.createElement("span");
  meta.className = "media-meta";
  const location = document.createElement("strong");
  location.textContent = "Iquitos, Perú";
  const kind = document.createElement("span");
  kind.textContent = item.type === "video" ? "Historia en movimiento" : "Celebración real";
  const open = document.createElement("span");
  open.className = "media-open";
  open.setAttribute("aria-hidden", "true");
  open.textContent = item.type === "video" ? "▶" : "↗";
  meta.append(location, kind);
  overlay.append(meta, open);
  card.append(media, overlay);
  return card;
};

const renderGallery = () => {
  if (!grid) return;
  const items = filteredMedia();
  const visibleItems = items.slice(0, visibleLimit);
  const fragment = document.createDocumentFragment();
  visibleItems.forEach((item, index) => fragment.append(mediaNode(item, index)));
  grid.replaceChildren(fragment);
  loadMoreButton.hidden = visibleItems.length >= items.length;
};

const updateCounts = () => {
  const imageCount = portfolioMedia.filter((item) => item.type === "image").length;
  const videoCount = portfolioMedia.length - imageCount;
  document.querySelector("#count-all").textContent = String(portfolioMedia.length);
  document.querySelector("#count-images").textContent = String(imageCount);
  document.querySelector("#count-videos").textContent = String(videoCount);
};

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    visibleLimit = 12;
    filters.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("is-active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    renderGallery();
  });
});

loadMoreButton?.addEventListener("click", () => {
  visibleLimit += 9;
  renderGallery();
});

grid?.addEventListener("pointerover", (event) => {
  const video = event.target.closest(".media-card")?.querySelector("video");
  if (video) video.play().catch(() => {});
});

grid?.addEventListener("pointerout", (event) => {
  const card = event.target.closest(".media-card");
  if (card && !card.contains(event.relatedTarget)) {
    const video = card.querySelector("video");
    if (video) { video.pause(); video.currentTime = 0; }
  }
});

const closeLightbox = () => {
  lightboxStage?.querySelector("video")?.pause();
  lightbox?.close();
  document.body.classList.remove("is-locked");
  lightboxStage?.replaceChildren();
};

const openLightbox = (item) => {
  if (!lightbox || !lightboxStage) return;
  const media = document.createElement(item.type === "video" ? "video" : "img");
  media.src = item.src;
  if (item.type === "video") {
    media.controls = true;
    media.autoplay = true;
    media.playsInline = true;
  } else {
    media.alt = "Celebración en Iquitos, Perú";
  }
  lightboxType.textContent = item.type === "video" ? "Video" : "Fotografía";
  lightboxStage.replaceChildren(media);
  lightbox.showModal();
  document.body.classList.add("is-locked");
};

grid?.addEventListener("click", (event) => {
  const card = event.target.closest(".media-card");
  if (!card) return;
  openLightbox(portfolioMedia[Number(card.dataset.index)]);
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
lightbox?.addEventListener("cancel", (event) => { event.preventDefault(); closeLightbox(); });

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 })
  : null;

document.querySelectorAll(".reveal").forEach((element) => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add("is-visible");
});

const dateInput = document.querySelector('input[type="date"]');
if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

const contactForm = document.querySelector(".contact-form");
const formStartedAt = { value: Date.now() };
let csrfToken = "";

const validationMessages = {
  name: (value) => /^[\p{L}\p{M}][\p{L}\p{M}'’ .-]{1,79}$/u.test(value.trim()) ? "" : "Escribe un nombre válido de 2 a 80 caracteres.",
  phone: (value) => /^\+?[0-9()\s-]{7,20}$/.test(value.trim()) ? "" : "Escribe un número de celular válido.",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value.trim()) && value.length <= 120 ? "" : "Escribe un correo válido, por ejemplo nombre@dominio.com.",
  date: (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value) ? "" : "Selecciona una fecha válida.",
  message: (value) => value.trim().length >= 20 && value.trim().length <= 1200 ? "" : "Cuéntanos un poco más: entre 20 y 1200 caracteres.",
  consent: (value) => value ? "" : "Necesitamos tu autorización para responder la consulta."
};

const fieldElement = (name) => contactForm?.elements.namedItem(name);
const setFieldError = (name, message = "") => {
  const field = fieldElement(name);
  const error = document.querySelector(`#${name}-error`);
  if (!field || !error) return;
  error.textContent = message;
  field.setAttribute("aria-invalid", String(Boolean(message)));
  field.closest(".form-field, .consent-field")?.classList.toggle("has-error", Boolean(message));
};

const validateField = (name) => {
  const field = fieldElement(name);
  if (!field || !validationMessages[name]) return "";
  const value = field.type === "checkbox" ? field.checked : field.value;
  const message = validationMessages[name](value);
  setFieldError(name, message);
  return message;
};

const validateForm = () => {
  const names = Object.keys(validationMessages);
  const invalid = names.filter((name) => validateField(name));
  if (invalid.length) fieldElement(invalid[0])?.focus();
  return invalid.length === 0;
};

Object.keys(validationMessages).forEach((name) => {
  const field = fieldElement(name);
  field?.addEventListener("blur", () => validateField(name));
  field?.addEventListener(field.type === "checkbox" ? "change" : "input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(name);
  });
});

const refreshCsrfToken = async () => {
  const response = await fetch("/api/csrf", { headers: { Accept: "application/json" }, credentials: "same-origin" });
  if (!response.ok) throw new Error("CSRF_UNAVAILABLE");
  csrfToken = (await response.json()).token;
};

const showFormStatus = (message, type = "") => {
  const status = contactForm?.querySelector(".form-status");
  if (!status) return;
  status.textContent = message;
  status.className = `form-status${type ? ` is-${type}` : ""}`;
};

const submitContact = async (payload, retry = true) => {
  if (!csrfToken) await refreshCsrfToken();
  const response = await fetch("/api/contact", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({ ok: false, message: "Respuesta inesperada del servidor." }));
  if (response.status === 403 && result.code === "CSRF" && retry) {
    await refreshCsrfToken();
    return submitContact(payload, false);
  }
  return { response, result };
};

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  showFormStatus("");
  if (!validateForm()) {
    showFormStatus("Revisa los campos marcados antes de enviar.", "error");
    return;
  }

  const submitButton = contactForm.querySelector(".form-submit");
  const submitLabel = contactForm.querySelector(".submit-label");
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitLabel.textContent = "Enviando…";

  const payload = {
    name: fieldElement("name").value,
    phone: fieldElement("phone").value,
    email: fieldElement("email").value,
    date: fieldElement("date").value,
    message: fieldElement("message").value,
    consent: fieldElement("consent").checked,
    website: fieldElement("website").value,
    startedAt: formStartedAt.value
  };

  try {
    const { response, result } = await submitContact(payload);
    if (result.fields) Object.entries(result.fields).forEach(([name, message]) => setFieldError(name, message));
    if (!response.ok) {
      showFormStatus(result.message || "No pudimos enviar tu consulta.", "error");
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }
    contactForm.reset();
    Object.keys(validationMessages).forEach((name) => setFieldError(name));
    formStartedAt.value = Date.now();
    showFormStatus(result.message, "success");
    await refreshCsrfToken();
  } catch {
    showFormStatus("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitLabel.textContent = "Enviar consulta";
  }
});

refreshCsrfToken().catch(() => showFormStatus("El formulario no está disponible temporalmente.", "error"));

const cookieBanner = document.querySelector("#cookie-banner");
const consentKey = "elite_cookie_consent_v1";
let savedCookieChoice = null;
try { savedCookieChoice = localStorage.getItem(consentKey); } catch {}
if (cookieBanner && !savedCookieChoice) cookieBanner.hidden = false;
cookieBanner?.querySelectorAll("[data-cookie-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    try { localStorage.setItem(consentKey, button.dataset.cookieChoice); } catch {}
    cookieBanner.hidden = true;
  });
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
updateCounts();
renderGallery();
