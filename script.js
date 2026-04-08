document.addEventListener('DOMContentLoaded', () => {
    // Loader
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 600);
            }, 2000);
        });
    }

    // Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuLinks = document.querySelectorAll('.menu-links a');

    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', () => {
            menuOverlay.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });

        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuOverlay.classList.remove('active');
                menuToggle.classList.remove('open');
            });
        });
    }

    // Reveal on Scroll
    const reveals = document.querySelectorAll('.reveal, .discipline-item');
    if (reveals.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else if (entry.target.classList.contains('discipline-item')) {
                    entry.target.classList.remove('active');
                }
            });
        }, { threshold: 0.15 });

        reveals.forEach(el => revealObserver.observe(el));
    }

    // Parallax
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroBg = document.querySelector('.hero-bg img');
        if (heroBg) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    // Gallery Logic - Attaching to project items for robustness
    const galleryOverlay = document.getElementById("galleryOverlay");
    const closeGallery = document.getElementById("closeGallery");

    document.querySelectorAll('.project-item').forEach(item => {
        const title = item.querySelector('h4').innerText;
        if (title.includes("Curated Lounge")) {
            item.style.cursor = "pointer"; // Make the whole box look clickable
            item.addEventListener("click", (e) => {
                // If the user clicked a link (like the button), let the other listener handle it or prevent it here
                e.preventDefault();
                
                if (galleryOverlay) {
                    galleryOverlay.style.display = "flex";
                    requestAnimationFrame(() => {
                        galleryOverlay.classList.add("active");
                        document.body.style.overflow = "hidden";
                    });
                }
            });
        }
    });

    // Also keep the button listener just in case
    document.querySelectorAll('.view-project').forEach(btn => {
        btn.addEventListener("click", (e) => {
            // If this is the Curated Lounge project (by ID or text check)
            if (btn.id === "view-lounge-project" || btn.innerText.includes("CURATED LOUNGE") || btn.closest('.project-item').querySelector('h4').innerText.includes("Curated Lounge")) {
                e.preventDefault();
                e.stopPropagation();
                
                if (galleryOverlay) {
                    galleryOverlay.style.display = "flex";
                    // Using requestAnimationFrame for smoother entry
                    requestAnimationFrame(() => {
                        galleryOverlay.classList.add("active");
                        document.body.style.overflow = "hidden";
                    });
                }
            }
        });
    });

    if (closeGallery && galleryOverlay) {
        closeGallery.addEventListener("click", (e) => {
            e.preventDefault();
            galleryOverlay.classList.remove("active");
            setTimeout(() => {
                galleryOverlay.style.display = "none";
                document.body.style.overflow = "auto";
            }, 800);
        });
    }

    // Lightbox Logic
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeLightbox = document.getElementById("closeLightbox");

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent gallery overlay from handling this
            const imgSrc = item.querySelector('img').src;
            if (lightbox && lightboxImg) {
                lightboxImg.src = imgSrc;
                lightbox.style.display = "flex";
                setTimeout(() => {
                    lightbox.classList.add("active");
                }, 10);
            }
        });
    });

    if (closeLightbox && lightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.classList.remove("active");
            setTimeout(() => {
                lightbox.style.display = "none";
            }, 500);
        });

        // Close on clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
                setTimeout(() => {
                    lightbox.style.display = "none";
                }, 500);
            }
        });
    }
});
