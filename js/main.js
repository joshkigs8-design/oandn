// Main JavaScript for O & N FITS website

// Register GSAP plugins
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 500);
    }
});

// Animated particles background (disabled on mobile for performance)
function createParticles() {
    if (window.innerWidth <= 768) return; // Disable on mobile
    
    const container = document.createElement('div');
    container.className = 'particles-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '0';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = 'rgba(201, 168, 106, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.position = 'absolute';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        container.appendChild(particle);

        gsap.to(particle, {
            y: `-=${Math.random() * 200 + 100}`,
            x: `+=${(Math.random() - 0.5) * 100}`,
            opacity: 0,
            duration: Math.random() * 10 + 10,
            repeat: -1,
            yoyo: true,
            ease: 'none'
        });
    }
}

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                scrollTo: { y: target, offsetY: 80 },
                duration: 1.2,
                ease: 'power3.inOut'
            });
        }
    }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');

if (hamburger && navList) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navList.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        if (navList && navList.classList.contains('active')) {
            navList.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (hamburger && navList && !hamburger.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Scroll-triggered animations (disabled on mobile for performance)
function initScrollAnimations() {
    if (typeof ScrollTrigger === 'undefined' || !ScrollTrigger) {
        return;
    }
    if (window.innerWidth <= 768) return; // Disable on mobile
    
    gsap.utils.toArray('.product-card, .stat-card, .review-item').forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.utils.toArray('h1, h2, .section-title').forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 1,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });
}

// Button hover effects
document.addEventListener('mouseenter', (e) => {
    const target = e.target;
    if (target && target.classList && (target.classList.contains('btn-primary') || target.classList.contains('btn-secondary'))) {
        gsap.to(target, { scale: 1.05, duration: 0.3 });
    }
}, true);

document.addEventListener('mouseleave', (e) => {
    const target = e.target;
    if (target && target.classList && (target.classList.contains('btn-primary') || target.classList.contains('btn-secondary'))) {
        gsap.to(target, { scale: 1, duration: 0.3 });
    }
}, true);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initScrollAnimations();
    
    // Animate hero text character by character
    const heroTitle = document.querySelector('.hero-text h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.innerHTML = '';
        const chars = text.split('');
        chars.forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'shimmer-char';
            span.style.animationDelay = `${0.5 + i * 0.05}s`;
            heroTitle.appendChild(span);
        });
    }
});

// WhatsApp link generator
function generateWhatsAppLink(productName, price) {
    const phoneNumber = '254112854091';
    const message = `Hello I want to order ${productName} - KSH ${price}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

// Export for other scripts
window.generateWhatsAppLink = generateWhatsAppLink;

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

window.showToast = showToast;

// Loading button helper
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('btn-loading');
        button.disabled = true;
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}

window.setButtonLoading = setButtonLoading;