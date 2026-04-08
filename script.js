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
        const heroBg = document.querySelector('.hero-bg img, .hero-bg video');
        if (heroBg) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    // Force Video Play - Critical for background videos
    const bgVideo = document.querySelector('.hero-bg video');
    if (bgVideo) {
        bgVideo.play().catch(error => {
            console.log("Autoplay was prevented:", error);
            // On user interaction, try to play
            const playOnGesture = () => {
                bgVideo.play();
                document.removeEventListener('click', playOnGesture);
            };
            document.addEventListener('click', playOnGesture);
        });
    }

    // Gallery Logic - General Functions
    const openProjectGallery = (overlay, gridId = null) => {
        if (overlay) {
            overlay.style.display = "flex";
            requestAnimationFrame(() => {
                overlay.classList.add("active");
                document.body.style.overflow = "hidden";
                
                // Reset view state
                const folders = overlay.querySelector('.gallery-folders-wrap');
                const grids = overlay.querySelectorAll('.gallery-image-grid-wrap');
                
                if (gridId) {
                    if (folders) folders.style.display = 'none';
                    grids.forEach(g => {
                        if (g.id === gridId) {
                            g.classList.add('active');
                        } else {
                            g.classList.remove('active');
                        }
                    });
                    overlay.classList.add('folder-opened');
                } else {
                    if (folders) folders.style.display = 'grid';
                    grids.forEach(g => g.classList.remove('active'));
                    overlay.classList.remove('folder-opened');
                }
            });
        }
    };

    window.showFolderContent = (box, gridId) => {
        const overlay = box.closest('.gallery-overlay');
        const gridWrap = overlay.querySelector(`#${gridId}`);
        if (gridWrap) {
            gridWrap.classList.add('active');
            overlay.classList.add('folder-opened');
        }
    };

    window.hideFolderContent = (btn) => {
        const gridWrap = btn.closest('.gallery-image-grid-wrap');
        const overlay = btn.closest('.gallery-overlay');
        gridWrap.classList.remove('active');
        overlay.classList.remove('folder-opened');
    };

    window.closeProjectGallery = (overlay) => {
        if (overlay) {
            overlay.classList.remove("active");
            setTimeout(() => {
                overlay.style.display = "none";
                document.body.style.overflow = "auto";
                
                // Reset View for next time
                const folders = overlay.querySelector('.gallery-folders-wrap');
                const grids = overlay.querySelectorAll('.gallery-image-grid-wrap');
                if (folders) folders.style.display = 'grid';
                grids.forEach(g => g.classList.remove('active'));
                overlay.classList.remove('folder-opened');
            }, 800);
        }
    };

    // Project Overlays
    const portfolioOverlay = document.getElementById("portfolioOverlay");
    const closePortfolio = document.getElementById("closePortfolioGallery");

    // "VIEW ALL PROJECTS" Button
    const viewAllBtn = document.getElementById("view-all-projects-btn");
    if (viewAllBtn) {
        viewAllBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openProjectGallery(portfolioOverlay);
        });
    }

    document.querySelectorAll('.project-item').forEach((item) => {
        item.style.cursor = "pointer";
        item.addEventListener("click", (e) => {
            if (e.target.tagName !== 'A') {
                const gridId = item.getAttribute('data-grid');
                openProjectGallery(portfolioOverlay, gridId);
            }
        });
    });

    // View Buttons on Main Cards (if any remain)
    document.querySelectorAll('.view-project').forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const gridId = btn.getAttribute('data-grid');
            openProjectGallery(portfolioOverlay, gridId);
        });
    });

    if (closePortfolio) closePortfolio.addEventListener("click", (e) => { e.preventDefault(); closeProjectGallery(portfolioOverlay); });

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
