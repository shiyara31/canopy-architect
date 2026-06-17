document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis with duration-based exponential easing
    // smoothTouch is set to false to respect the native, hardware-accelerated momentum scroll on mobile
    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1.0,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    window.lenis = lenis;

    // Scroll Progress Bar Logic
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.appendChild(progressBar);

    // Page Reveal (Immediate)
    document.body.classList.add('page-loaded');


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

    // Parallax & Progress Bar Integration
    lenis.on('scroll', (e) => {
        // Progress Bar (safe check for limit to avoid NaN or Infinity)
        const scrollPercent = e.limit > 0 ? (e.scroll / e.limit) * 100 : 0;
        progressBar.style.transform = `scaleX(${scrollPercent / 100})`;

        // Hero Parallax
        const heroBg = document.querySelector('.hero-bg img, .hero-bg video');
        if (heroBg) {
            heroBg.style.transform = `translateY(${e.scroll * 0.3}px)`;
        }
    });

    // Hero Video Optimization
    const bgVideo = document.querySelector('.hero-bg video');
    if (bgVideo) {
        // Force play logic (enhanced)
        const attemptPlay = () => {
            bgVideo.play().catch(() => {
                // If autoplay fails, wait for interaction
                const playOnGesture = () => {
                    bgVideo.play();
                    document.removeEventListener('click', playOnGesture);
                    document.removeEventListener('touchstart', playOnGesture);
                };
                document.addEventListener('click', playOnGesture);
                document.addEventListener('touchstart', playOnGesture);
            });
        };

        attemptPlay();
    }

    // Gallery Logic - General Functions
    let savedScrollPos = 0;

    const openProjectGallery = (overlay, gridId = null) => {
        if (overlay) {
            overlay.removeAttribute('data-lenis-prevent');
            savedScrollPos = window.pageYOffset || document.documentElement.scrollTop;
            document.body.classList.add('gallery-active');
            
            overlay.style.display = "flex";
            if(window.lenis) {
                window.lenis.resize(); // Recalculate dimensions for the new active layout
                window.lenis.scrollTo(0, {immediate: true});
            } else {
                window.scrollTo(0, 0);
            }

            requestAnimationFrame(() => {
                overlay.classList.add("active");
                
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
                
                // Resize lenis again after gallery transitions/animations are complete
                setTimeout(() => { if (window.lenis) window.lenis.resize(); }, 150);
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
            if(window.lenis) {
                window.lenis.resize(); // Recalculate size since contents changed
                window.lenis.scrollTo(0, {immediate: true});
            } else {
                window.scrollTo(0, 0);
            }
        }
    };

    window.hideFolderContent = (btn) => {
        const gridWrap = btn.closest('.gallery-image-grid-wrap');
        const overlay = btn.closest('.gallery-overlay');
        const folders = overlay.querySelector('.gallery-folders-wrap');
        
        gridWrap.classList.remove('active');
        overlay.classList.remove('folder-opened');
        if (folders) folders.style.display = 'grid';
        if(window.lenis) {
            window.lenis.resize(); // Recalculate size since contents changed
            window.lenis.scrollTo(0, {immediate: true});
        } else {
            window.scrollTo(0, 0);
        }
    };

    window.closeProjectGallery = (overlay) => {
        if (overlay) {
            overlay.classList.remove("active");
            setTimeout(() => {
                overlay.style.display = "none";
                document.body.classList.remove('gallery-active');
                if (window.lenis) {
                    window.lenis.resize(); // Recalculate bounds for regular page
                    window.lenis.scrollTo(savedScrollPos, {immediate: true});
                } else {
                    window.scrollTo(0, savedScrollPos);
                }
                
                // Reset View for next time
                const folders = overlay.querySelector('.gallery-folders-wrap');
                const grids = overlay.querySelectorAll('.gallery-image-grid-wrap');
                if (folders) folders.style.display = 'grid';
                grids.forEach(g => g.classList.remove('active'));
                overlay.classList.remove('folder-opened');
                
                // Resize once more after transitions are fully done
                setTimeout(() => { if (window.lenis) window.lenis.resize(); }, 150);
            }, 800);
        }
    };

    // Project Overlays
    const portfolioOverlay = document.getElementById("portfolioOverlay");
    const closePortfolio = document.getElementById("closePortfolioGallery");

    // Handle Project Card and View Project Clicks
    const initProjectClicks = () => {
        document.querySelectorAll('.project-item').forEach((item) => {
            item.style.cursor = "pointer";
            item.addEventListener("click", (e) => {
                // Open gallery if not clicking a link elsewhere
                if (e.target.tagName !== 'A' || e.target.classList.contains('view-project')) {
                    e.preventDefault();
                    const gridId = item.getAttribute('data-grid');
                    openProjectGallery(portfolioOverlay, gridId);
                }
            });
        });

        // Specific handling for buttons if they are nested differently
        document.querySelectorAll('.view-project').forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const gridId = btn.getAttribute('data-grid');
                openProjectGallery(portfolioOverlay, gridId);
            });
        });
    };

    initProjectClicks();

    if (closePortfolio) closePortfolio.addEventListener("click", (e) => { e.preventDefault(); closeProjectGallery(portfolioOverlay); });

    // Lightbox Logic
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeLightbox = document.getElementById("closeLightbox");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");

    let currentGalleryImages = [];
    let currentImageIndex = 0;

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent gallery overlay from handling this
            
            const grid = item.closest('.gallery-grid');
            if (grid) {
                const imgElements = Array.from(grid.querySelectorAll('.gallery-item img'));
                currentGalleryImages = imgElements.map(img => img.src);
                currentImageIndex = imgElements.indexOf(item.querySelector('img'));
            } else {
                currentGalleryImages = [item.querySelector('img').src];
                currentImageIndex = 0;
            }

            if (lightbox && lightboxImg) {
                lightboxImg.src = currentGalleryImages[currentImageIndex];
                lightbox.style.display = "flex";
                if(window.lenis) window.lenis.stop();
                setTimeout(() => {
                    lightbox.classList.add("active");
                }, 10);
            }
        });
    });

    if (lightboxPrev && lightboxNext) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length > 1) {
                currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                lightboxImg.src = currentGalleryImages[currentImageIndex];
            }
        });

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length > 1) {
                currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
                lightboxImg.src = currentGalleryImages[currentImageIndex];
            }
        });
    }

    if (closeLightbox && lightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.classList.remove("active");
            if(window.lenis) window.lenis.start();
            setTimeout(() => {
                lightbox.style.display = "none";
            }, 500);
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
                if(window.lenis) window.lenis.start();
                setTimeout(() => {
                    lightbox.style.display = "none";
                }, 500);
            }
        });
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

    // Process Stacking Slabs Logic (Parallax and Fade)
    const slabs = document.querySelectorAll('.process-slab');
    if (slabs.length > 0) {
        window.addEventListener('scroll', () => {
            const viewportHeight = window.innerHeight;
            
            slabs.forEach((slab, index) => {
                const rect = slab.getBoundingClientRect();
                const scrollProgress = (viewportHeight - rect.top) / viewportHeight;
                
                // Subtle scale effect when entering
                if (scrollProgress > 0 && scrollProgress < 1.5) {
                    const info = slab.querySelector('.slab-info');
                    const step = slab.querySelector('.slab-step');
                    
                    if (info) {
                        const translateY = (1 - Math.min(scrollProgress, 1)) * 50;
                        info.style.transform = `translateY(${translateY}px)`;
                        info.style.opacity = Math.min(scrollProgress * 2, 1);
                    }
                    
                    if (step) {
                        const stepTranslateY = (1 - Math.min(scrollProgress, 1)) * 100;
                        step.style.transform = `translateY(${stepTranslateY}px)`;
                    }
                }

                // Stacking Scale Reduction (Cards feel smaller as they are covered)
                const topThreshold = 200; // px from top
                if (rect.top < topThreshold) {
                    const factor = Math.max(0.9, 1 - (topThreshold - rect.top) / 2000);
                    slab.style.transform = `scale(${factor})`;
                } else {
                    slab.style.transform = `scale(1)`;
                }
            });
        });
    }
    // Navbar Scroll Background
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl && window.lenis) {
                e.preventDefault();
                window.lenis.scrollTo(targetEl, {
                    duration: 1.2,
                    offset: -80, // Offset for fixed header
                });
            }
        });
    });

    // Smooth scroll to hash on page load
    if (window.location.hash) {
        const targetEl = document.querySelector(window.location.hash);
        if (targetEl && window.lenis) {
            window.lenis.scrollTo(0, { immediate: true });
            setTimeout(() => {
                window.lenis.scrollTo(targetEl, {
                    duration: 1.5,
                    offset: -80,
                });
            }, 100);
        }
    }


    // Instagram Dropdown Toggle for Mobile
    document.querySelectorAll('.instagram-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                this.classList.toggle('active');
                if (e.target.closest('a') && !e.target.closest('.insta-dropdown')) {
                    e.preventDefault();
                }
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.instagram-wrapper')) {
            document.querySelectorAll('.instagram-wrapper').forEach(w => w.classList.remove('active'));
        }
    });

    // Debounced Lenis resize to prevent layout thrashing and scroll lag
    let resizeTimeout;
    const debouncedLenisResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.lenis) {
                window.lenis.resize();
            }
        }, 100);
    };

    // Resize Lenis on window resize
    window.addEventListener('resize', debouncedLenisResize);

    // Resize Lenis when images load to prevent scroll bounding issues
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) {
            debouncedLenisResize();
        } else {
            img.addEventListener('load', debouncedLenisResize);
        }
    });

});
