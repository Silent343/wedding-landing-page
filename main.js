/* =========================================
   1. MOBILE NAVIGATION MENU
   ========================================= */
const navMenu = document.querySelector(".nav-links");
const navToggle = document.querySelector(".mobile-menu-toggle");

if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("is-active-menu");
    });

    // Close menu after selecting a link (better mobile UX)
    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("is-active-menu");
        });
    });
}

/* =========================================
   2. SCROLL REVEAL (Scroll Animations)
   ========================================= */
if (typeof ScrollReveal !== "undefined") {
    const sr = ScrollReveal({
        reset: false,
        distance: '20px',
    });

    sr.reveal('.scroll-reveal-item', { duration: 900, interval: 60 });
    sr.reveal('.about-image-wrapper', { duration: 900 });
    sr.reveal('.moments-wrapper', { duration: 900 });
    sr.reveal('.process-step', { duration: 700, interval: 100 });
}

/* =========================================
   3. MOMENTS MARQUEE — auto-scroll + drag
   ========================================= */
const marquee = document.getElementById("moments-marquee");
const track = document.getElementById("moments-track");

if (marquee && track) {
    // Duplicar las tarjetas para lograr un loop infinito sin saltos
    track.innerHTML += track.innerHTML;

    let offset = 0;
    let isDragging = false;
    let startX = 0;
    let startOffset = 0;
    let autoSpeed = 0.45; // px por frame — velocidad del auto-scroll
    let halfWidth = track.scrollWidth / 2;

    function recalcHalfWidth() {
        halfWidth = track.scrollWidth / 2;
    }
    window.addEventListener("resize", recalcHalfWidth);

    function applyOffset() {
        // Loop infinito: cuando pasa la mitad (duplicado), reinicia sin salto visible
        if (offset >= halfWidth) offset -= halfWidth;
        if (offset < 0) offset += halfWidth;
        track.style.transform = `translateX(-${offset}px)`;
    }

    function tick() {
        if (!isDragging) {
            offset += autoSpeed;
            applyOffset();
        }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function dragStart(clientX) {
        isDragging = true;
        startX = clientX;
        startOffset = offset;
        marquee.classList.add("is-dragging");
    }

    function dragMove(clientX) {
        if (!isDragging) return;
        const delta = clientX - startX;
        offset = startOffset - delta;
        applyOffset();
    }

    function dragEnd() {
        isDragging = false;
        marquee.classList.remove("is-dragging");
    }

    // Mouse
    marquee.addEventListener("mousedown", (e) => dragStart(e.clientX));
    window.addEventListener("mousemove", (e) => dragMove(e.clientX));
    window.addEventListener("mouseup", dragEnd);
    marquee.addEventListener("mouseleave", dragEnd);

    // Touch
    marquee.addEventListener("touchstart", (e) => dragStart(e.touches[0].clientX), { passive: true });
    marquee.addEventListener("touchmove", (e) => dragMove(e.touches[0].clientX), { passive: true });
    marquee.addEventListener("touchend", dragEnd);
}

/* =========================================
   3b. ABOUT IMAGE — parallax sutil con scroll
   ========================================= */
const aboutImage = document.querySelector(".about-image");

if (aboutImage) {
    window.addEventListener("scroll", () => {
        const rect = aboutImage.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const distanceFromCenter = (rect.top + rect.height / 2) - viewportCenter;
        // Movimiento muy sutil: máximo ~14px de desplazamiento vertical
        const translateY = Math.max(-14, Math.min(14, distanceFromCenter * -0.04));
        aboutImage.style.transform = `translateY(${translateY}px)`;
    }, { passive: true });
}

/* =========================================
   3b. GALLERY LIGHTBOX
   ========================================= */
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const galleryItems = document.querySelectorAll(".gallery-item");
const momentImages = document.querySelectorAll(".moment-card img");

function openLightbox(src, alt) {
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
}

if (lightbox && galleryItems.length > 0) {
    galleryItems.forEach((img) => {
        img.addEventListener("click", () => openLightbox(img.src, img.alt));
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
            closeLightbox();
        }
    });
}

// Las tarjetas del marquee también abren el lightbox (clic simple, sin interferir con el drag)
if (lightbox && momentImages.length > 0) {
    momentImages.forEach((img) => {
        let moved = false;
        img.closest(".moment-card").addEventListener("mousedown", () => { moved = false; });
        img.closest(".moment-card").addEventListener("mousemove", () => { moved = true; });
        img.closest(".moment-card").addEventListener("click", () => {
            if (!moved) openLightbox(img.src, img.alt);
        });
    });
}

/* =========================================
   4. FORM SUBMISSION FEEDBACK
   ========================================= */
const contactForm = document.querySelector(".contact-form");
const formLoader = document.querySelector(".form-loader");

if (contactForm) {
    contactForm.addEventListener("submit", () => {
        if (formLoader) formLoader.style.display = "block";

        if (typeof iziToast !== "undefined") {
            iziToast.success({
                title: 'Mensaje enviado',
                message: 'Gracias por escribir. Te contactaré muy pronto para hablar de tu boda.',
                position: 'topRight',
            });
        }
    });
}

/* =========================================
   5. FOOTER — CURRENT YEAR
   ========================================= */
const yearEl = document.getElementById("current-year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}