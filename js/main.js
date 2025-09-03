// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }, 1200); // Show preloader for 1.2 seconds
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Smooth scrolling and active nav
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(item.getAttribute('href'));

        // Remove active class from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));

        // Add active class to clicked item
        item.classList.add('active');

        // Scroll to section
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Close mobile menu
        navMenu.classList.remove('active');
    });
});

// Intersection Observer for section animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Update active nav item
            const sectionId = entry.target.getAttribute('id');
            navItems.forEach(nav => nav.classList.remove('active'));
            const activeNav = document.querySelector(`a[href="#${sectionId}"]`);
            if (activeNav) activeNav.classList.add('active');
        }
    });
}, observerOptions);

// Observe all sections
sections.forEach(section => {
    observer.observe(section);
});

// Typing animation for hero name
const heroName = document.querySelector('.hero-name');
const text = heroName.textContent;
heroName.textContent = '';

let i = 0;
const typeWriter = () => {
    if (i < text.length) {
        heroName.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
};

setTimeout(typeWriter, 1000);

// Parallax effect for hero image
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        const speed = scrolled * 0.5;
        heroImage.style.transform = `translateY(${speed}px)`;
    }
});

// Smooth reveal animations
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.portfolio-item, .timeline-item, .contact-item');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Initialize animations
window.addEventListener('scroll', animateOnScroll);
animateOnScroll(); // Run once on load

// Add initial animation states
document.querySelectorAll('.portfolio-item, .timeline-item, .contact-item').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
});

// Resume download functionality
function downloadResume(event) {
    event.preventDefault();
    // Create a link element
    const link = document.createElement('a');
    link.href = 'assets/resume.pdf'; // Update this path to your actual resume file
    link.download = 'Prasanta_Badatya_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}