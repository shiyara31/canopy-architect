document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('careersForm');
    const submitBtn = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show loading state
            submitBtn.classList.add('loading');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.innerText;
            btnText.innerText = 'PREPARING...';

            // Form Data
            const position = document.getElementById('career_position').value;
            const name = document.getElementById('career_name').value;
            const email = document.getElementById('career_email').value;
            const phone = document.getElementById('career_phone').value;
            const portfolio = document.getElementById('career_portfolio').value;
            const message = document.getElementById('career_message').value;

            // Construct Mailto link
            const recipient = "ar.canopy@gmail.com";
            const subject = encodeURIComponent(`Career Application: ${position}`);
            const bodyValue = `Application Details:\n\nPosition: ${position}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPortfolio Link: ${portfolio}\n\nMessage:\n${message}`;
            const body = encodeURIComponent(bodyValue);
            
            const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

            window.location.href = mailtoLink;
            form.reset();
        });
    }

    // Parallax effect for application image
    // Parallax effect for application image
    const updateParallax = () => {
        const parallaxImg = document.querySelector('.parallax-img');
        if (parallaxImg) {
            const rect = parallaxImg.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const move = (window.innerHeight - rect.top) * 0.1;
                parallaxImg.style.transform = `scale(1.1) translateY(${-move}px)`;
            }
        }
    }

    if (window.lenis) {
        window.lenis.on('scroll', updateParallax);
    } else {
        window.addEventListener('scroll', updateParallax);
    }

    // Reveal animations integration (if not handled globally)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
