document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 100);
    });

    // Loader
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }, 2000); // 2 second delay for premium feel
    });

    // Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuLinks = document.querySelectorAll('.menu-links a');

    menuToggle.addEventListener('click', () => {
        menuOverlay.classList.toggle('active');
        menuToggle.classList.toggle('open');
        
        // Custom animation for menu lines if needed
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });

    // Reveal on Scroll (Intersection Observer)
    const reveals = document.querySelectorAll('.reveal, .discipline-item');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.classList.contains('reveal')) {
                    observer.unobserve(entry.target);
                }
            } else if (entry.target.classList.contains('discipline-item')) {
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.4 // More specific threshold for disciplines
    });

    reveals.forEach(el => revealObserver.observe(el));

    // Smooth Parallax for Hero Background (Subtle)
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroBg = document.querySelector('.hero-bg img');
        if (heroBg) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
});
