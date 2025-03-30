// Try dynamic import for Three.js to ensure it works in production
let THREE;

// Function to initialize a Three.js scene
export async function initThreeJsScene() {
  // Dynamically import Three.js
  THREE = await import('three');
  
  // Create a container for the 3D scene
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '-1';
  container.style.opacity = '0.7';
  container.id = 'bird-background';
  document.body.appendChild(container);

  // Create a scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f8ff); // Light blue sky background

  // Create a camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Create a simple bird-like shape
  const birdGeometry = new THREE.ConeGeometry(0.5, 1, 4);
  const birdMaterial = new THREE.MeshBasicMaterial({ color: 0x3a86ff });
  const bird = new THREE.Mesh(birdGeometry, birdMaterial);
  scene.add(bird);

  // Add wings
  const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
  const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x8ecae6 });
  const wings = new THREE.Mesh(wingGeometry, wingMaterial);
  bird.add(wings);

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the bird
    bird.rotation.y += 0.01;
    bird.rotation.z += 0.005;
    
    renderer.render(scene, camera);
  }

  animate();
} 