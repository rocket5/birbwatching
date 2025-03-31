// Main JavaScript file
import { initThreeJsScene } from './bird3d.js';
//import { initSceneAndLoadGLB } from './testLoader.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Birb Watching website loaded');
  
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

  try {
    // Initialize Three.js scene in the left column
    const container = document.getElementById('bird3d-container');
    initThreeJsScene(container);
    //initSceneAndLoadGLB();
  } catch (error) {
    console.error('Error initializing 3D scene:', error);
  }
}); 