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
    container.style.opacity = '0';
    container.id = 'bird-background';
    document.body.appendChild(container);
  }

  // Create a scene
  const scene = new THREE.Scene();

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light with shadow casting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 5, 0);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  // Create a camera
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1, 1);

  // Create a renderer with shadow support
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0); // 0 alpha = fully transparent background
  container.appendChild(renderer.domElement);

  // Create a circle geometry to receive shadows under the bird
  const shadowRadius = 0.5;
  const shadowSegments = 32;
  const shadowGeometry = new THREE.CircleGeometry(shadowRadius, shadowSegments);
  const shadowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2a9d8f,
    transparent: true,
    opacity: 0,
    alphaTest: 0.1,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide
  });

  const shadowCircle = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadowCircle.rotation.x = -Math.PI / 2; // Rotate to lie flat
  shadowCircle.position.set(0, -1, 0); // Position under the bird's feet
  shadowCircle.receiveShadow = true;
  shadowCircle.scale.set(2, 2, 2);
  scene.add(shadowCircle);
  
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

  // Add a debug function for animations
  function printAnimationInfo() {
    console.log(`----- Animation Debug Info -----`);
    console.log(`Total animations: ${animations.length}`);
    console.log(`Current animation index: ${currentAnimation}`);
    if (currentAnimation >= 0 && currentAnimation < animations.length) {
      console.log(`Current animation name: ${animations[currentAnimation].name}`);
    } else {
      console.log(`Invalid current animation index!`);
    }
    console.log(`Random animation active: ${randomAnimationActive}`);
    console.log(`Allowed animations: ${allowedAnimations.join(', ')}`);
    console.log(`Actions in cache: ${Array.from(animationActions.keys()).join(', ')}`);
    console.log(`--------------------------------`);
  }

  function playAnimation(index, fadeTime = 0.5) {
    if (mixer && animations.length > 0 && index >= 0 && index < animations.length) {
      // Store previous index for debugging
      const prevIndex = currentAnimation;
      
      // Update the current animation index for UI consistency
      currentAnimation = index;
      
      console.log(`Animation change: ${prevIndex} -> ${currentAnimation}`);
      
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
    } else {
      console.warn(`Attempted to play invalid animation index: ${index}`);
    }
  }
  
  /**
   * Tim: Animation names don't match the animation indices, so we're using the indices directly
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
      animationNames: options.animationNames || [],
      animationIndices: options.animationIndices || [4, 5, 6, 14, 15, 16],
      minDuration: options.minDuration || 1,
      maxDuration: options.maxDuration || 3,
      fadeTime: options.fadeTime || 0.5
    };
    
    console.log(`Starting random animation with options:`, config);
    
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
          console.log(`Found animation "${name}" at index ${nameToIndexMap[name]}`);
        } else {
          console.warn(`Animation name not found: "${name}"`);
        }
      });
      
      console.log("Animation name to index mappings:", nameToIndexMap);
    } 
    // If animation indices are provided, use them
    else if (config.animationIndices && config.animationIndices.length > 0) {
      allowedAnimations = config.animationIndices.filter(index => {
        const isValid = index >= 0 && index < animations.length;
        if (isValid) {
          console.log(`Using animation index ${index}: "${animations[index].name}"`);
        } else {
          console.warn(`Invalid animation index: ${index}`);
        }
        return isValid;
      });
    } 
    // If neither names nor indices are provided, use all animations
    else {
      allowedAnimations = animations.map((anim, index) => {
        console.log(`Including all animations: ${index}: "${anim.name}"`);
        return index;
      });
    }
    
    console.log(`Selected ${allowedAnimations.length} animations for random playback:`, 
                allowedAnimations.map(i => `${i}: "${animations[i].name}"`));
    
    // Don't proceed if we don't have any valid animations
    if (allowedAnimations.length === 0) {
      console.warn('No valid animations found for random playback');
      return { stop: () => {} };
    }
    
    // Mark random animation as active
    randomAnimationActive = true;
    
    // Choose an initial animation to start with
    let lastIndex = -1;
    
    // Function to play a random animation
    const playRandomAnimation = () => {
      // Pick a random animation from the allowed list, but not the same as last time if possible
      let randomIndex, animationIndex;
      
      if (allowedAnimations.length > 1) {
        // Try to avoid playing the same animation twice in a row
        do {
          randomIndex = Math.floor(Math.random() * allowedAnimations.length);
          animationIndex = allowedAnimations[randomIndex];
        } while (animationIndex === lastIndex && allowedAnimations.length > 1);
      } else {
        randomIndex = 0;
        animationIndex = allowedAnimations[0];
      }
      
      lastIndex = animationIndex;
      
      console.log(`Random animation selected: index=${animationIndex}, name="${animations[animationIndex].name}"`);
      
      // Play it with crossfading
      playAnimation(animationIndex, config.fadeTime);
      
      // Schedule the next animation
      const nextDuration = Math.random() * 
        (config.maxDuration - config.minDuration) + config.minDuration;
      
      console.log(`Next animation in ${nextDuration.toFixed(2)} seconds`);
      
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
      heartBirb.scale.set(1.25, 1.25, 1.25);
      heartBirb.position.set(0, -0.8, 0);
      heartBirb.rotation.set(0, 20, 0);
      
      // Enable shadows for the bird model
      heartBirb.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      
      scene.add(heartBirb);
      
      // Search for the Birb_3 mesh and apply texture
      // const textureLoader = new THREE.TextureLoader();
      // const baseTextureUrl = `${baseUrl}assets/models/Birb_3_Base_Color.png`;
      
      // heartBirb.traverse((node) => {
      //   if (node.isMesh && node.name === 'Birb_3') {
      //     console.log('Found Birb_3 mesh, applying texture');
          
      //     // Load the texture
      //     textureLoader.load(baseTextureUrl, (texture) => {
      //       const material = new THREE.MeshStandardMaterial({
      //         map: texture,
      //         roughness: 1,
      //         metalness: 0
      //       });
            
      //       // Apply the material to the mesh
      //       node.material = material;
      //     });
      //   }
      // });
      
      // Get all animations
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(heartBirb);
        animations.push(...gltf.animations);
        
        // List all animations with their proper indexes
        console.log(`Loaded ${animations.length} animations:`);
        console.log(`----- Available Animations -----`);
        animations.forEach((anim, index) => {
          // Log with the actual array index
          console.log(`Index ${index}: "${anim.name}" (duration: ${anim.duration.toFixed(2)}s)`);
        });
        console.log(`-----------------------------`);
        
        // Create a map of animation names for easy reference
        const animationNameMap = {};
        animations.forEach((anim, index) => {
          animationNameMap[anim.name] = index;
        });
        console.log("Animation name map:", animationNameMap);
        
        // Log default animation names to verify they exist
        const defaultAnimations = ["Peck", "Peck_R", "Peck_L", "Idle_Tweet", "Idle_LookAround", "Idle"];
        console.log("Checking if default animations exist:");
        defaultAnimations.forEach(name => {
          if (animationNameMap.hasOwnProperty(name)) {
            console.log(`✓ "${name}" exists at index ${animationNameMap[name]}`);
          } else {
            console.log(`✗ "${name}" does not exist in the loaded animations`);
          }
        });
        
        // Start random animation automatically once model and animations are loaded
        startRandomAnimation();
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