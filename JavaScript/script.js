document.addEventListener("DOMContentLoaded", () => {
    // Keep the copyright year current without changing page content.
    document.querySelectorAll("footer p").forEach((paragraph) => {
        paragraph.innerHTML = paragraph.innerHTML.replace(/©\s*\d{4}/, `© ${new Date().getFullYear()}`);
    });

    // Dynamic service catalogue with live search and sorting.
    const serviceList = document.getElementById("service-list");
    if (serviceList) {
        const services = [
            {
                name: "Standard Sneaker Clean",
                description: "Refresh sneakers affected by everyday dirt, dust and surface marks.",
                ideal: "Everyday sneakers, light dirt and regular maintenance.",
                image: "images/Services/standard-sneaker-cleaning-service.webp",
                alt: "Sneakers receiving a standard cleaning service"
            },
            {
                name: "Deep Clean",
                description: "A more intensive cleaning option for footwear requiring additional attention.",
                ideal: "Heavily soiled sneakers, stubborn marks and extra cleaning.",
                image: "images/Services/deep-sneaker-cleaning-service.webp",
                alt: "Sneakers receiving a detailed deep cleaning service"
            },
            {
                name: "Sole Care",
                description: "Focused cleaning for sneaker soles and areas frequently exposed to dirt.",
                ideal: "Dirty soles and customers wanting a cleaner overall appearance.",
                image: "images/Services/sneaker-sole-care-service.jpg",
                alt: "Sneaker sole receiving professional cleaning care"
            },
            {
                name: "Premium Shoe Care",
                description: "A detailed shoe-care option for customers seeking a comprehensive clean.",
                ideal: "Premium sneakers and special-occasion footwear.",
                image: "images/Services/premium-sneaker-care-service.webp",
                alt: "Premium sneaker care service in progress"
            }
        ];

        const search = document.getElementById("service-search");
        const sort = document.getElementById("service-sort");
        const count = document.getElementById("service-count");

        function renderServices() {
            const term = search.value.trim().toLowerCase();
            let visible = services.filter((item) =>
                `${item.name} ${item.description} ${item.ideal}`.toLowerCase().includes(term)
            );

            if (sort.value === "az") visible.sort((a, b) => a.name.localeCompare(b.name));
            if (sort.value === "za") visible.sort((a, b) => b.name.localeCompare(a.name));

            serviceList.replaceChildren();
            visible.forEach((item) => {
                const card = document.createElement("article");
                const heading = document.createElement("h3");
                heading.textContent = item.name;
                const description = document.createElement("p");
                description.textContent = item.description;
                const idealHeading = document.createElement("h4");
                idealHeading.textContent = "Ideal for";
                const ideal = document.createElement("p");
                ideal.textContent = item.ideal;
                const image = document.createElement("img");
                image.src = item.image;
                image.alt = item.alt;
                image.loading = "lazy";
                const link = document.createElement("a");
                link.href = `enquiry.html?service=${encodeURIComponent(item.name)}`;
                link.textContent = "Enquire About This Service";
                card.append(heading, description, idealHeading, ideal, image, link);
                serviceList.append(card);
            });
            count.textContent = `${visible.length} of ${services.length} services displayed.`;
            if (!visible.length) {
                const empty = document.createElement("p");
                empty.textContent = "No services match your search. Try another keyword.";
                serviceList.append(empty);
            }
        }

        search.addEventListener("input", renderServices);
        sort.addEventListener("change", renderServices);
        renderServices();
    }

    // FAQ accordion: only one answer remains open at a time.
    document.querySelectorAll(".faq-question").forEach((button) => {
        button.addEventListener("click", () => {
            const answer = button.closest(".faq-item").querySelector(".faq-answer");
            const shouldOpen = button.getAttribute("aria-expanded") !== "true";
            document.querySelectorAll(".faq-question").forEach((other) => {
                other.setAttribute("aria-expanded", "false");
                other.closest(".faq-item").querySelector(".faq-answer").hidden = true;
            });
            button.setAttribute("aria-expanded", String(shouldOpen));
            answer.hidden = !shouldOpen;
        });
    });

    // Gallery lightbox: images open in a keyboard-accessible modal overlay.
    const galleryImages = document.querySelectorAll(".gallery-grid img");
    if (galleryImages.length) {
        const lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.id = "gallery-lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-label", "Expanded gallery image");
        lightbox.hidden = true;
        lightbox.innerHTML = `
            <button type="button" class="lightbox-close" aria-label="Close enlarged image">&times;</button>
            <figure><img class="lightbox-image" alt=""><figcaption class="lightbox-caption"></figcaption></figure>
            <p class="lightbox-help">Press Escape or select close to return to the gallery.</p>`;
        document.body.append(lightbox);
        const largeImage = lightbox.querySelector(".lightbox-image");
        const caption = lightbox.querySelector(".lightbox-caption");
        const closeButton = lightbox.querySelector(".lightbox-close");
        let previousFocus = null;

        function closeLightbox() {
            lightbox.hidden = true;
            document.body.classList.remove("lightbox-open");
            if (previousFocus) previousFocus.focus();
        }

        galleryImages.forEach((image) => {
            image.tabIndex = 0;
            image.setAttribute("role", "button");
            image.setAttribute("aria-label", `Enlarge ${image.alt}`);
            image.addEventListener("click", openImage);
            image.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openImage.call(image);
                }
            });
        });

        function openImage() {
            previousFocus = document.activeElement;
            largeImage.src = this.currentSrc || this.src;
            largeImage.alt = this.alt;
            caption.textContent = this.closest("figure")?.querySelector("figcaption")?.textContent || this.alt;
            lightbox.hidden = false;
            document.body.classList.add("lightbox-open");
            closeButton.focus();
        }

        closeButton.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) closeLightbox();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
        });
    }

    // Interactive Leaflet map on the Contact page.
    const mapElement = document.getElementById("service-map");
    if (mapElement && window.L) {
        const map = L.map(mapElement).setView([-25.724, 28.39], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        const locations = [
            { name: "Mamelodi service area", coords: [-25.706, 28.366], note: "Primary service area." },
            { name: "Pretoria East service area", coords: [-25.781, 28.305], note: "Enquiries welcome; confirm availability." }
        ];
        locations.forEach((location) => {
            L.marker(location.coords).addTo(map)
                .bindPopup(`<strong>${location.name}</strong><br>${location.note}`);
        });
        L.control.scale().addTo(map);
        setTimeout(() => map.invalidateSize(), 250);
    } else if (mapElement) {
        mapElement.textContent = "The interactive map could not load. Please check your internet connection.";
    }

    // Shared form helpers: custom validation gives immediate, understandable feedback.
    function validateForm(form, feedback) {
        form.querySelectorAll("input, select, textarea").forEach((field) => {
            field.setCustomValidity("");
            if (field.type === "tel" && field.value.trim() && !/^(?:\+27|0)[0-9]{9}$/.test(field.value.trim())) {
                field.setCustomValidity("Enter a South African number, for example 0712345678 or +27712345678.");
            }
            if (field.type === "date" && field.value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const chosen = new Date(`${field.value}T00:00:00`);
                if (chosen < today) field.setCustomValidity("Choose today or a future date.");
            }
        });

        if (!form.checkValidity()) {
            form.reportValidity();
            feedback.textContent = "Please correct the highlighted fields before continuing.";
            feedback.classList.add("error");
            return false;
        }
        feedback.textContent = "";
        feedback.classList.remove("error");
        return true;
    }

    // Enquiry form: validates input and returns a service-specific next-step response.
    const enquiryForm = document.getElementById("enquiry-form");
    if (enquiryForm) {
        const feedback = document.getElementById("enquiry-feedback");
        const dateField = document.getElementById("date");
        const todayString = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        dateField.min = todayString;

        const params = new URLSearchParams(window.location.search);
        const requestedService = params.get("service");
        if (requestedService) {
            const option = [...enquiryForm.elements.service.options].find((item) => item.text === requestedService);
            if (option) enquiryForm.elements.service.value = option.value;
        }

        enquiryForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!validateForm(enquiryForm, feedback)) return;
            const data = new FormData(enquiryForm);
            feedback.classList.remove("error");
            feedback.textContent = `Thank you, ${data.get("fullname")}. Your request for ${data.get("quantity")} pair(s) of ${data.get("shoes")} under ${data.get("service")} has been captured on this page. Sole Revive will need to confirm the final price and availability after assessing the footwear. This demonstration form does not transmit or store your details.`;
            feedback.classList.add("success");
            feedback.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        enquiryForm.addEventListener("reset", () => {
            feedback.textContent = "";
            feedback.classList.remove("success", "error");
        });
    }

    // Contact form: compile validated details into a pre-addressed email.
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        const feedback = document.getElementById("contact-feedback");
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!validateForm(contactForm, feedback)) return;
            const data = new FormData(contactForm);
            const subject = `Sole Revive - ${data.get("subject")}`;
            const body = [
                `Name: ${data.get("name")}`,
                `Email: ${data.get("email")}`,
                `Phone: ${data.get("phone") || "Not provided"}`,
                "",
                "Message:",
                data.get("message")
            ].join("\n");
            const mailto = `mailto:info@solerevive.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            feedback.textContent = "Your message has been validated. Your email application should open with the details prepared; review it and press Send to deliver it.";
            feedback.classList.remove("error");
            feedback.classList.add("success");
            window.location.href = mailto;
        });
        contactForm.addEventListener("reset", () => {
            feedback.textContent = "";
            feedback.classList.remove("success", "error");
        });


    // Small visual extras: reveal-on-scroll, reading progress, back-to-top and click ripples.
    // All motion is disabled when the visitor requests reduced motion.
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const effectsStyle = document.createElement("style");
    effectsStyle.textContent = `
        html { scroll-behavior: smooth; }
        .sr-progress { position: fixed; inset: 0 auto auto 0; height: 4px; width: 0; z-index: 10000;
            background: linear-gradient(90deg, #d9a441, #f4d27a); box-shadow: 0 1px 8px rgba(217,164,65,.35); pointer-events: none; }
        .sr-reveal { opacity: 0; transform: translateY(22px); transition: opacity .65s ease, transform .65s ease; }
        .sr-reveal.is-visible { opacity: 1; transform: translateY(0); }
        #service-list article { transition: transform .25s ease, box-shadow .25s ease; }
        #service-list article:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(0,0,0,.12); }
        .sr-top { position: fixed; right: 1.2rem; bottom: 1.2rem; z-index: 900; width: 46px; height: 46px;
            border: 0; border-radius: 50%; background: #d9a441; color: #171717; font-size: 1.35rem; font-weight: 700;
            box-shadow: 0 5px 18px rgba(0,0,0,.2); cursor: pointer; opacity: 0; visibility: hidden;
            transform: translateY(10px); transition: opacity .2s ease, transform .2s ease, visibility .2s; }
        .sr-top.is-visible { opacity: 1; visibility: visible; transform: translateY(0); }
        .sr-ripple-host { position: relative; overflow: hidden; isolation: isolate; }
        .sr-ripple { position: absolute; z-index: -1; border-radius: 50%; pointer-events: none; background: rgba(255,255,255,.38);
            transform: scale(0); animation: sr-ripple .55s ease-out forwards; }
        @keyframes sr-ripple { to { transform: scale(1); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            .sr-reveal, #service-list article, .sr-top { transition: none !important; transform: none !important; }
            .sr-reveal { opacity: 1 !important; }
            .sr-ripple { display: none !important; }
        }
    `;
    document.head.append(effectsStyle);

    const progressBar = document.createElement("div");
    progressBar.className = "sr-progress";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.append(progressBar);

    const topButton = document.createElement("button");
    topButton.className = "sr-top";
    topButton.type = "button";
    topButton.textContent = "↑";
    topButton.setAttribute("aria-label", "Back to top");
    document.body.append(topButton);
    topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: motionPreference.matches ? "auto" : "smooth" }));

    function updateScrollDecorations() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        progressBar.style.width = `${Math.min(100, progress)}%`;
        topButton.classList.toggle("is-visible", window.scrollY > 420);
    }
    window.addEventListener("scroll", updateScrollDecorations, { passive: true });
    window.addEventListener("resize", updateScrollDecorations);
    updateScrollDecorations();

    // Reveal content as it enters the viewport. A fallback keeps content visible on older browsers.
    const revealTargets = document.querySelectorAll("main section, main h1, main > p, .gallery-grid figure, #service-list article");
    if (!motionPreference.matches && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
        revealTargets.forEach((element) => {
            element.classList.add("sr-reveal");
            revealObserver.observe(element);
        });
        // Also animate service cards created after the initial page load.
        const serviceContainer = document.getElementById("service-list");
        if (serviceContainer) {
            new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.matches("article")) {
                    node.classList.add("sr-reveal");
                    revealObserver.observe(node);
                }
            }))).observe(serviceContainer, { childList: true });
        }
    } else {
        revealTargets.forEach((element) => element.classList.add("is-visible"));
    }

    // A subtle ripple gives buttons and links tactile feedback without changing navigation.
    if (!motionPreference.matches) {
        document.addEventListener("click", (event) => {
            const target = event.target.closest("button, .button, a.button, input[type='submit']");
            if (!target || target.disabled) return;
            const rect = target.getBoundingClientRect();
            const diameter = Math.max(rect.width, rect.height) * 1.35;
            const ripple = document.createElement("span");
            ripple.className = "sr-ripple";
            ripple.style.width = `${diameter}px`;
            ripple.style.height = `${diameter}px`;
            ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
            ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
            target.classList.add("sr-ripple-host");
            target.append(ripple);
            ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
        });
    }
    }
});
