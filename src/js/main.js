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

  // Logo text fade-in effect
  const logoText = document.querySelector('.logo-text');
  if (logoText) {
    logoText.style.opacity = '0';
    logoText.style.transition = 'opacity 1s ease-in-out';
    
    setTimeout(() => {
      logoText.style.opacity = '1';
    }, 500);
  }

  try {
    // Initialize Three.js scene in the bird model container
    const container = document.getElementById('bird3d-container');
    if (container) {
      initThreeJsScene(container);
    } else {
      console.error('Bird container element not found');
    }
    //initSceneAndLoadGLB();
  } catch (error) {
    console.error('Error initializing 3D scene:', error);
  }

  // Initialize Plyr
  const player = new Plyr('#player', {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'captions',
      'settings',
      'pip',
      'airplay',
      'fullscreen'
    ],
    loadSprite: true,
    iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
    blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    ratio: '1:1',
    autoplay: false,
    muted: false,
    invertTime: true,
    clickToPlay: true,
    disableContextMenu: true,
    resetOnEnd: false,
    displayDuration: true,
    invertVolume: false,
    listeners: {
      ready: (event) => {
        console.log('Plyr is ready');
      },
      play: (event) => {
        console.log('Video playing');
      },
      pause: (event) => {
        console.log('Video paused');
      }
    }
  });
}); 