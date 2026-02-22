// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
    });
});

// Mobile menu
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}
function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.add('hidden');
}

// Navbar scroll effect (minor polish)
window.addEventListener("scroll", function () {
    const nav = document.getElementById("navbar");
    if (window.scrollY > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});