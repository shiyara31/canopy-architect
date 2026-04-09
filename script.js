document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    window.lenis = lenis;

    // Loader
    const loader = document.getElementById('loader');
    const hasLoaded = sessionStorage.getItem('hasLoaded');

    const isContactPage = window.location.pathname.includes('contact.html');

    if (loader && !hasLoaded && !isContactPage) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    document.body.classList.add('page-loaded');
                    sessionStorage.setItem('hasLoaded', 'true');
                }, 600);
            }, 1000);
        });
    } else {
        // Instant show for contact page or if already loaded
        if (loader) loader.style.display = 'none';
        document.body.classList.add('page-loaded');
    }

    // Text Cascade (Word-by-word reveal)
    const cascadeElements = document.querySelectorAll('.cascade-text');
    cascadeElements.forEach(el => {
        const words = el.innerText.split(' ');
        el.innerHTML = words.map((word, i) => 
            `<span class="cascade-word" style="transition-delay: ${i * 0.05}s">${word}</span>`
        ).join(' ');
    });

    // Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuLinks = document.querySelectorAll('.menu-links a');

    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', () => {
            menuOverlay.classList.toggle('active');
            menuToggle.classList.toggle('open');
            
            if (menuOverlay.classList.contains('active')) {
                if (window.lenis) window.lenis.stop();
            } else {
                if (window.lenis) window.lenis.start();
            }
        });

        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.includes('.html')) {
                    if (href.includes('contact.html')) {
                        // Go to contact page directly as requested
                        return;
                    }
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
    const reveals = document.querySelectorAll('.reveal, .discipline-item, .cascade-text');
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
            // Force folders to hide instantly
            const folders = overlay.querySelector('.gallery-folders-wrap');
            if (folders) folders.style.display = 'none';
            
            gridWrap.classList.add('active');
            overlay.classList.add('folder-opened');
            overlay.scrollTop = 0; // Reset scroll to top of project details
        }
    };

    window.hideFolderContent = (btn) => {
        const gridWrap = btn.closest('.gallery-image-grid-wrap');
        const overlay = btn.closest('.gallery-overlay');
        const folders = overlay.querySelector('.gallery-folders-wrap');
        
        gridWrap.classList.remove('active');
        overlay.classList.remove('folder-opened');
        if (folders) folders.style.display = 'grid';
        overlay.scrollTop = 0;
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

    // Stats Counter Animation
    const statsCounters = document.querySelectorAll('.stat-counter');
    if (statsCounters.length > 0) {
        const countTo = (el) => {
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const stepTime = 20;
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    // Final value cleanup
                    el.innerText = target < 10 ? target.toString().padStart(2, '0') : target;
                    clearInterval(timer);
                } else {
                    const rounded = Math.floor(current);
                    el.innerText = target < 10 && rounded < 10 ? rounded.toString().padStart(2, '0') : rounded;
                }
            }, stepTime);
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    countTo(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsCounters.forEach(counter => statsObserver.observe(counter));
    }
});
