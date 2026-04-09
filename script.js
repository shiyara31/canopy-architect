document.addEventListener('DOMContentLoaded', () => {
    // Direct Page Entry (No Loader)
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 100);

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
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.includes('.html')) {
                    e.preventDefault();
                    document.body.classList.add('page-exiting');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 800);
                } else {
                    menuOverlay.classList.remove('active');
                    menuToggle.classList.remove('open');
                }
            });
        });

        const menuCloseBtn = document.getElementById('menuCloseBtn');
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', () => {
                menuOverlay.classList.remove('active');
                menuToggle.classList.remove('open');
            });
        }
    }

    // Reveal on Scroll
    const reveals = document.querySelectorAll('.reveal, .reveal-mask, .discipline-item');
    if (reveals.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(el => revealObserver.observe(el));
    }

    // Enhanced Parallax Logic
    const parallaxItems = document.querySelectorAll('.project-img-container img, .hero-bg img, .hero-bg video');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const viewportHeight = window.innerHeight;

        parallaxItems.forEach(item => {
            const rect = item.parentElement.getBoundingClientRect();
            const isVisible = rect.top < viewportHeight && rect.bottom > 0;

            if (isVisible) {
                // Calculate how far the item is through the viewport (0 to 1)
                const relativeProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
                const movement = (relativeProgress - 0.5) * 150; // Total range of 150px

                if (item.closest('.hero-bg')) {
                    item.style.transform = `translate3d(0, ${scrolled * 0.3}px, 0)`;
                } else {
                    const scale = item.parentElement.classList.contains('active') ? 1 : 1.15;
                    item.style.transform = `translate3d(0, ${movement}px, 0) scale(${scale})`;
                }
            }
        });
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

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
                setTimeout(() => {
                    lightbox.style.display = "none";
                }, 500);
            }
        });
    }

    // Magic Dots Generation
    const magicDotsContainer = document.querySelector('.magic-dots');
    if (magicDotsContainer) {
        for (let i = 0; i < 200; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.top = `${Math.random() * 100}%`;
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.animationDuration = `${2 + Math.random() * 3}s`;
            dot.style.animationDelay = `${Math.random() * 5}s`;
            magicDotsContainer.appendChild(dot);
        }

        // Hide dots on first slide (hero)
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        magicDotsContainer.style.opacity = '0';
                    } else {
                        magicDotsContainer.style.opacity = '1';
                    }
                });
            }, { threshold: 0.1 });
            heroObserver.observe(heroSection);
        }
    }
});
