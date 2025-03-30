// Import Three.js and GLTFLoader
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Function to initialize a Three.js scene with the HeartBirb model
export function initThreeJsScene() {
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
  camera.position.z = 10;

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xf0f8ff);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Add a second directional light from the opposite direction
  const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
  backLight.position.set(-5, 3, -5);
  scene.add(backLight);

  // Load the HeartBirb model
  const loader = new GLTFLoader();
  let heartBirb; // To store the loaded model

  // Get the base URL from the import.meta if in development,
  // or use the configured base path if in production
  const baseUrl = import.meta.env.DEV ? '' : import.meta.env.BASE_URL || '/birbwatching/';
  
  // Path to model in public directory
  const modelPath = `${baseUrl}assets/models/HeartBirb.glb`;
  console.log('Loading model from:', modelPath);
  
  loader.load(
    modelPath,
    (gltf) => {
      console.log('Model loaded successfully');
      heartBirb = gltf.scene;
      
      // Scale the model if needed
      heartBirb.scale.set(1, 1, 1);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(heartBirb);
      const center = box.getCenter(new THREE.Vector3());
      heartBirb.position.x = -center.x;
      heartBirb.position.y = -center.y;
      heartBirb.position.z = -center.z;
      
      scene.add(heartBirb);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      console.error('Error loading model:', error);
      
      // Fall back to a basic shape if model loading fails
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
    }
  );

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Rotate the model if it's loaded
    if (heartBirb) {
      heartBirb.rotation.y += 0.005; // Slowed down rotation to allow for manual control
    }
    
    renderer.render(scene, camera);
  }

  animate();
} 