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

    // Inquiry Form Submission Handler
    const inquiryForms = document.querySelectorAll('.inquiry-form');
    inquiryForms.forEach(form => {
        if (form.id === 'careersForm') return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form fields
            const nameInput = form.querySelector('input[placeholder="Your Name"]');
            const emailInput = form.querySelector('input[placeholder="name@email.com"]');
            const serviceInput = form.querySelector('input[placeholder="Service Required"]');
            const messageInput = form.querySelector('textarea[placeholder="Tell us about your project..."]');
            const submitBtn = form.querySelector('button[type="submit"]');

            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const service = serviceInput ? serviceInput.value : '';
            const message = messageInput ? messageInput.value : '';

            let originalText = "Send Inquiry Now";
            if (submitBtn) {
                originalText = submitBtn.innerText;
                submitBtn.innerText = 'SUBMITTING...';
                submitBtn.disabled = true;
            }

            // Send via FormSubmit AJAX
            fetch("https://formsubmit.co/ajax/ar.canopy@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "_subject": `Inquiry from ${name}`,
                    "Name": name,
                    "Email": email,
                    "Service Required": service,
                    "Message": message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (submitBtn) {
                    submitBtn.innerText = 'SENT SUCCESSFULLY!';
                    form.reset();
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    form.reset();
                }
            })
            .catch(error => {
                if (submitBtn) {
                    submitBtn.innerText = 'FAILED. TRY AGAIN';
                    submitBtn.disabled = false;
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                    }, 3000);
                }
            });
        });
    });

    // Schedule Call Modal Logic
    const initScheduleCallModal = () => {
        let modalOverlay = document.getElementById('scheduleCallModal');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'scheduleCallModal';
            modalOverlay.className = 'schedule-modal-overlay';
            modalOverlay.innerHTML = `
                <div class="schedule-modal-card">
                    <button class="schedule-modal-close" aria-label="Close modal">&times;</button>
                    <h3 class="schedule-modal-title">Schedule a Call</h3>
                    <p class="schedule-modal-sub">Connect directly with our Kerala design studio team.</p>
                    <div class="schedule-options-grid">
                        <a href="tel:+918089231332" class="schedule-option-item">
                            <div class="schedule-option-info">
                                <span class="schedule-option-location">Kerala Studio &bull; India</span>
                                <span class="schedule-option-number">+91 80892 31332</span>
                            </div>
                            <div class="schedule-option-btn">
                                <span>Call Kerala</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            </div>
                        </a>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            const closeBtn = modalOverlay.querySelector('.schedule-modal-close');
            closeBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });

            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('active');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                    modalOverlay.classList.remove('active');
                }
            });
        }

        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.schedule-call-trigger, a[href="#schedule-call"]');
            if (trigger) {
                e.preventDefault();
                modalOverlay.classList.add('active');
            }
        });
    };

    initScheduleCallModal();

    // WhatsApp Float Quick Menu Logic
    const initWhatsAppQuickMenu = () => {
        const waBtn = document.querySelector('.whatsapp-float');
        if (!waBtn) return;

        let popup = document.getElementById('whatsappMenuPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'whatsappMenuPopup';
            popup.className = 'whatsapp-menu-popup';
            popup.innerHTML = `
                <div class="wa-popup-header">
                    <span>Connect With Us</span>
                    <button class="wa-popup-close" aria-label="Close">&times;</button>
                </div>
                <div class="wa-popup-options">
                    <a href="https://wa.me/918089231332" target="_blank" class="wa-popup-item">
                        <div class="wa-popup-icon wa-bg">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.411-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </div>
                        <div class="wa-popup-info">
                            <span class="wa-popup-title">WhatsApp Chat</span>
                            <span class="wa-popup-sub">Direct Message</span>
                        </div>
                    </a>
                    <a href="mailto:ar.canopy@gmail.com" class="wa-popup-item">
                        <div class="wa-popup-icon mail-bg">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <div class="wa-popup-info">
                            <span class="wa-popup-title">Email Address</span>
                            <span class="wa-popup-sub">ar.canopy@gmail.com</span>
                        </div>
                    </a>
                    <a href="tel:+918089231332" class="wa-popup-item">
                        <div class="wa-popup-icon phone-bg">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <div class="wa-popup-info">
                            <span class="wa-popup-title">Kerala Number</span>
                            <span class="wa-popup-sub">+91 80892 31332</span>
                        </div>
                    </a>
                </div>
            `;
            document.body.appendChild(popup);
        }

        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.whatsapp-float');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                popup.classList.toggle('active');
                return;
            }

            if (popup.classList.contains('active') && !popup.contains(e.target)) {
                popup.classList.remove('active');
            }
        });

        const closeBtn = popup.querySelector('.wa-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                popup.classList.remove('active');
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                popup.classList.remove('active');
            }
        });
    };

    initWhatsAppQuickMenu();

});
