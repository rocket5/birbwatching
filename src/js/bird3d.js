// Import Three.js and required loaders
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Function to initialize a Three.js scene
export function initThreeJsScene(targetContainer = null) {
  // Use provided container or create a new one
  const container = targetContainer || document.createElement('div');
  
  if (!targetContainer) {
    // Only set these styles if we're creating a new container
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
    container.style.opacity = '0.9';
    container.id = 'bird-background';
    document.body.appendChild(container);
  }

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
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1, 1);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.minPolarAngle = Math.PI / 2; // 90 degrees
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.update();

  // Create animation mixer
  let mixer;
  let heartBirb;
  const animations = [];
  let currentAnimation = 0;
  const clock = new THREE.Clock();
  
  // Random animation variables
  let randomAnimationActive = false;
  let randomAnimationTimer = null;
  let allowedAnimations = []; // List of animations that can be played randomly (by name or index)
  let currentAction = null;
  let previousAction = null;
  
  // Animation actions cache to avoid recreating actions
  const animationActions = new Map();

  // Create animation control UI
  const animationControlsContainer = document.createElement('div');
  animationControlsContainer.style.position = 'absolute';
  animationControlsContainer.style.bottom = '10px';
  animationControlsContainer.style.left = '50%';
  animationControlsContainer.style.transform = 'translateX(-50%)';
  animationControlsContainer.style.zIndex = '2';
  animationControlsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
  animationControlsContainer.style.padding = '10px';
  animationControlsContainer.style.borderRadius = '5px';
  animationControlsContainer.style.display = 'flex';
  animationControlsContainer.style.gap = '10px';
  container.appendChild(animationControlsContainer);

  // Previous animation button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.style.padding = '5px 10px';
  prevButton.addEventListener('click', () => {
    if (animations.length > 0) {
      stopRandomAnimation();
      playAnimation(currentAnimation);
      currentAnimation = (currentAnimation - 1 + animations.length) % animations.length;
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
      stopRandomAnimation();
      playAnimation(currentAnimation);
      currentAnimation = (currentAnimation + 1) % animations.length;
      updateAnimationLabel();
    }
  });
  animationControlsContainer.appendChild(nextButton);

  // Random animation button
  const randomButton = document.createElement('button');
  randomButton.textContent = 'Random';
  randomButton.style.padding = '5px 10px';
  randomButton.addEventListener('click', () => {
    if (animations.length > 0) {
      if (randomAnimationActive) {
        stopRandomAnimation();
        randomButton.textContent = 'Random';
      } else {
        startRandomAnimation();
        randomButton.textContent = 'Stop Random';
      }
    }
  });
  animationControlsContainer.appendChild(randomButton);

  function updateAnimationLabel() {
    if (animations.length > 0) {
      if (randomAnimationActive) {
        animationLabel.textContent = `Random: ${animations[currentAnimation].name}`;
      } else {
        animationLabel.textContent = `${animations[currentAnimation].name} (${currentAnimation + 1}/${animations.length})`;
      }
    } else {
      animationLabel.textContent = 'No animations';
    }
  }

  function playAnimation(index, fadeTime = 0.5) {
    if (mixer && animations.length > 0) {
      // Get or create the animation action
      let action;
      if (animationActions.has(index)) {
        action = animationActions.get(index);
      } else {
        action = mixer.clipAction(animations[index]);
        animationActions.set(index, action);
      }

      // If we already have a current action, create a crossfade
      if (currentAction) {
        // Store the previous action for crossfading
        previousAction = currentAction;
        
        // Set up crossfade parameters
        previousAction.fadeOut(fadeTime);
        action.reset().fadeIn(fadeTime).play();
        
        // After fade duration, stop the previous action completely
        setTimeout(() => {
          if (previousAction) {
            previousAction.stop();
          }
        }, fadeTime * 1000);
      } else {
        // No previous action, just play
        action.reset().play();
      }
      
      // Update current action reference
      currentAction = action;
      
      console.log(`Playing animation: ${animations[index].name}, index: ${index}`);
    }
  }
  
  /**
   * Plays random animations from a specified list with crossfading
   * @param {Object} options - Configuration options
   * @param {Array} [options.animationNames] - List of animation names to include (if empty, all animations are used)
   * @param {Array} [options.animationIndices] - List of animation indices to include (alternative to animationNames)
   * @param {number} [options.minDuration=3] - Minimum duration in seconds before changing animations
   * @param {number} [options.maxDuration=8] - Maximum duration in seconds before changing animations
   * @param {number} [options.fadeTime=0.5] - Duration of crossfade between animations in seconds
   * @returns {Object} - Controls for the random animation (stop function)
   */
  function startRandomAnimation(options = {}) {
    // Default options
    const config = {
      animationNames: options.animationNames || ["Peck", "Peck_R", "Peck_L", "Idle_Tweet", "Idle_LookAround", "Idle"],
      animationIndices: options.animationIndices || [],
      minDuration: options.minDuration || 1,
      maxDuration: options.maxDuration || 3,
      fadeTime: options.fadeTime || 0.5
    };
    
    // Stop any existing random animation
    stopRandomAnimation();
    
    // Create a list of allowed animation indices
    allowedAnimations = [];
    
    // If animation names are provided, find their indices
    if (config.animationNames && config.animationNames.length > 0) {
      // Create a more accurate name-to-index mapping
      const nameToIndexMap = {};
      animations.forEach((anim, index) => {
        nameToIndexMap[anim.name] = index;
      });
      
      // Use the map to get the correct indices
      config.animationNames.forEach(name => {
        if (nameToIndexMap.hasOwnProperty(name)) {
          allowedAnimations.push(nameToIndexMap[name]);
        } else {
          console.warn(`Animation name not found: ${name}`);
        }
      });
      
      console.log("Animation name to index mappings:", nameToIndexMap);
      console.log("Allowed animations:", allowedAnimations);
    } 
    // If animation indices are provided, use them
    else if (config.animationIndices && config.animationIndices.length > 0) {
      allowedAnimations = config.animationIndices.filter(index => 
        index >= 0 && index < animations.length
      );
    } 
    // If neither names nor indices are provided, use all animations
    else {
      allowedAnimations = animations.map((_, index) => index);
    }
    
    // Don't proceed if we don't have any valid animations
    if (allowedAnimations.length === 0) {
      console.warn('No valid animations found for random playback');
      return { stop: () => {} };
    }
    
    // Mark random animation as active
    randomAnimationActive = true;
    
    // Function to play a random animation
    const playRandomAnimation = () => {
      // Pick a random animation from the allowed list
      const randomIndex = Math.floor(Math.random() * allowedAnimations.length);
      currentAnimation = allowedAnimations[randomIndex];
      
      // Play it with crossfading
      playAnimation(currentAnimation, config.fadeTime);
      updateAnimationLabel();
      
      // Schedule the next animation
      const nextDuration = Math.random() * 
        (config.maxDuration - config.minDuration) + config.minDuration;
      
      randomAnimationTimer = setTimeout(playRandomAnimation, nextDuration * 1000);
    };
    
    // Start the random animation sequence
    playRandomAnimation();
    
    // Return control object
    return { stop: stopRandomAnimation };
  }
  
  function stopRandomAnimation() {
    if (randomAnimationTimer) {
      clearTimeout(randomAnimationTimer);
      randomAnimationTimer = null;
    }
    randomAnimationActive = false;
    updateAnimationLabel();
    randomButton.textContent = 'Random';
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
      heartBirb.scale.set(1, 1, 1);
      heartBirb.position.set(0, -1, 0);
      scene.add(heartBirb);
      
      // Get all animations
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(heartBirb);
        animations.push(...gltf.animations);
        
        // list all animations
        console.log(`Loaded ${animations.length} animations:`);
        animations.forEach((anim, index) => {
          // Log with the actual array index to avoid confusion
          console.log(`${index}: ${anim.name}`);
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

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
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
  
  // Expose the random animation function so it can be called from outside
  container.startRandomAnimation = startRandomAnimation;
  container.stopRandomAnimation = stopRandomAnimation;

  animate();
  
  // Return the container with attached control methods
  return container;
}