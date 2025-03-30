// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
  console.log('BirdWatching website loaded');
  
  // Example of dynamically updating the copyright year
  const footerYear = document.querySelector('footer p');
  if (footerYear) {
    footerYear.innerHTML = footerYear.innerHTML.replace('2024', new Date().getFullYear());
  }
  
  // Example of a simple animation for the hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.style.opacity = '0';
    heroSection.style.transition = 'opacity 1s ease-in-out';
    
    setTimeout(() => {
      heroSection.style.opacity = '1';
    }, 200);
  }
}); 