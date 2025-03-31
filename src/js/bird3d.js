// Import Three.js and required loaders
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Function to initialize a Three.js scene
export function initThreeJsScene() {
  // Create a container for the 3D scene
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '-1';
  container.style.opacity = '0.9';
  container.id = 'bird-background';
  document.body.appendChild(container);

  // Create a scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f8ff); // Light blue sky background

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Create a camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 5);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.update();

  // Create animation mixer
  let mixer;
  let heartBirb;
  const animations = [];
  let currentAnimation = 0;
  const clock = new THREE.Clock();

  // Create animation control UI
  const animationControlsContainer = document.createElement('div');
  animationControlsContainer.style.position = 'absolute';
  animationControlsContainer.style.bottom = '20px';
  animationControlsContainer.style.left = '50%';
  animationControlsContainer.style.transform = 'translateX(-50%)';
  animationControlsContainer.style.zIndex = '100';
  animationControlsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
  animationControlsContainer.style.padding = '10px';
  animationControlsContainer.style.borderRadius = '5px';
  animationControlsContainer.style.display = 'flex';
  animationControlsContainer.style.gap = '10px';
  document.body.appendChild(animationControlsContainer);

  // Previous animation button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.style.padding = '5px 10px';
  prevButton.addEventListener('click', () => {
    if (animations.length > 0) {
      currentAnimation = (currentAnimation - 1 + animations.length) % animations.length;
      playAnimation(currentAnimation);
      updateAnimationLabel();
    }
  });
  animationControlsContainer.appendChild(prevButton);

  // Animation label
  const animationLabel = document.createElement('div');
  animationLabel.style.display = 'flex';
  animationLabel.style.alignItems = 'center';
  animationLabel.style.justifyContent = 'center';
  animationLabel.style.minWidth = '120px';
  animationLabel.textContent = 'No animations';
  animationControlsContainer.appendChild(animationLabel);

  // Next animation button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.style.padding = '5px 10px';
  nextButton.addEventListener('click', () => {
    if (animations.length > 0) {
      currentAnimation = (currentAnimation + 1) % animations.length;
      playAnimation(currentAnimation);
      updateAnimationLabel();
    }
  });
  animationControlsContainer.appendChild(nextButton);

  function updateAnimationLabel() {
    if (animations.length > 0) {
      animationLabel.textContent = `${animations[currentAnimation].name} (${currentAnimation + 1}/${animations.length})`;
    } else {
      animationLabel.textContent = 'No animations';
    }
  }

  function playAnimation(index) {
    if (mixer && animations.length > 0) {
      // Stop all animations
      mixer.stopAllAction();
      
      // Play the selected animation
      const action = mixer.clipAction(animations[index]);
      action.reset();
      action.play();
      
      console.log(`Playing animation: ${animations[index].name}`);
    }
  }

  // Load the HeartBirb model
  const loader = new GLTFLoader();
  
  // Use base URL to ensure paths work in deployment
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Path to model in public directory
  const modelPath = `${baseUrl}assets/models/HeartBirb.glb`;
  console.log('Loading model from:', modelPath);

  // Load the model directly using fetch with arraybuffer response type to prevent content parsing issues
  fetch(modelPath, { 
    headers: {
      'Accept': 'application/octet-stream'
    },
    cache: 'no-store' // Disable caching to ensure fresh content
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
      }
      return response.arrayBuffer();
    })
    .then(buffer => {
      // Pass the buffer directly to the GLTF loader
      return new Promise((resolve, reject) => {
        loader.parse(
          buffer, 
          '',
          resolve,
          reject
        );
      });
    })
    .then(gltf => {
      console.log('Model loaded successfully via fetch & parse method');
      
      heartBirb = gltf.scene;
      
      // Center and scale the model if needed
      heartBirb.scale.set(2, 2, 2);
      scene.add(heartBirb);
      
      // Get all animations
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(heartBirb);
        animations.push(...gltf.animations);
        
        console.log(`Loaded ${animations.length} animations:`);
        animations.forEach((anim, index) => {
          console.log(`${index + 1}: ${anim.name}`);
        });
        
        // Play the first animation by default
        if (animations.length > 0) {
          playAnimation(0);
          updateAnimationLabel();
        }
      } else {
        console.warn('No animations found in the model');
      }
    })
    .catch(error => {
      console.error('Error loading model:', error);
      console.error('Model path attempted:', modelPath);
      
      // Show error and create fallback
      showErrorMessage(`Error loading model: ${error.message} (Path: ${modelPath})`);
      createFallbackSphere();
      
      // Fall back to traditional loading method as last resort
      fallbackLoadMethod();
    });

  // Fallback traditional loading method as last resort
  function fallbackLoadMethod() {
    console.log('Attempting fallback loading method...');
    
    loader.load(
      modelPath,
      (gltf) => {
        console.log('Model loaded successfully via fallback method');
        
        heartBirb = gltf.scene;
        
        // Center and scale the model if needed
        heartBirb.scale.set(2, 2, 2);
        scene.add(heartBirb);
        
        // Get all animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(heartBirb);
          animations.push(...gltf.animations);
          
          console.log(`Loaded ${animations.length} animations:`);
          animations.forEach((anim, index) => {
            console.log(`${index + 1}: ${anim.name}`);
          });
          
          // Play the first animation by default
          if (animations.length > 0) {
            playAnimation(0);
            updateAnimationLabel();
          }
        } else {
          console.warn('No animations found in the model');
        }
      },
      (xhr) => {
        console.log(`Loading model (fallback): ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
      },
      (error) => {
        console.error('Error loading model via fallback method:', error);
      }
    );
  }

  // Helper function to show error messages
  function showErrorMessage(message) {
    const existingMessage = document.querySelector('div[data-error="model-load"]');
    if (!existingMessage) {
      const messageEl = document.createElement('div');
      messageEl.setAttribute('data-error', 'model-load');
      messageEl.style.position = 'absolute';
      messageEl.style.top = '10px';
      messageEl.style.left = '50%';
      messageEl.style.transform = 'translateX(-50%)';
      messageEl.style.background = 'rgba(255,0,0,0.7)';
      messageEl.style.color = 'white';
      messageEl.style.padding = '10px';
      messageEl.style.borderRadius = '5px';
      messageEl.style.zIndex = '1000';
      messageEl.textContent = message;
      document.body.appendChild(messageEl);
    }
  }

  // Helper function to create fallback sphere
  function createFallbackSphere() {
    if (!scene.getObjectByName('fallback-sphere')) {
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.name = 'fallback-sphere';
      scene.add(sphere);
    }
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Update the mixer on each frame
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    
    // Update controls
    controls.update();
    
    renderer.render(scene, camera);
  }

  animate();
}