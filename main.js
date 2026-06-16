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
    sr.reveal('.carousel', { duration: 900 });
}

/* =========================================
   3. CAROUSEL LOGIC
   ========================================= */
const carouselTrack = document.querySelector(".carousel-track");
const slidesCollection = document.querySelectorAll(".carousel-slide");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");

if (carouselTrack && slidesCollection.length > 0) {
    let currentIndex = 0;
    let slideInterval = setInterval(startAutoSlide, 4000);

    function startAutoSlide() {
        currentIndex++;
        updateCarouselPosition();
    }

    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(startAutoSlide, 4000);
    }

    function updateCarouselPosition() {
        if (currentIndex > slidesCollection.length - 1) {
            currentIndex = 0;
        } else if (currentIndex < 0) {
            currentIndex = slidesCollection.length - 1;
        }
        carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    nextBtn.addEventListener("click", () => {
        currentIndex++;
        resetSlideInterval();
        updateCarouselPosition();
    });

    prevBtn.addEventListener("click", () => {
        currentIndex--;
        resetSlideInterval();
        updateCarouselPosition();
    });
}

/* =========================================
   3b. GALLERY LIGHTBOX
   ========================================= */
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const galleryItems = document.querySelectorAll(".gallery-item");

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

    // Cerrar al hacer click en el fondo oscuro (no en la imagen)
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Cerrar con la tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
            closeLightbox();
        }
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