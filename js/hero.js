// Hero section JavaScript for 3D effects and animations

let scene, camera, renderer, model;

function initHero() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 0;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add renderer to the DOM
    const heroVideo = document.getElementById('hero-video');
    heroVideo.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create a simple mannequin placeholder (would be replaced with actual model)
    createMannequinPlaceholder();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

function createMannequinPlaceholder() {
    // Create a simple placeholder for the model
    // In a real implementation, this would load an actual 3D model (GLTF/OBJ)
    
    // Torso
    const torsoGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.4);
    const torsoMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4A0F1B, // Burgundy
        metalness: 0.1,
        roughness: 0.8
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 0;
    scene.add(torso);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color 0xF5F5F0, // Ivory
        metalness: 0.0,
        roughness: 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.2;
    scene.add(head);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const armMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4A0F1B,
        metalness: 0.1,
        roughness: 0.8
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 0.2, 0);
    scene.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.5, 0.2, 0);
    scene.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4A0F1B,
        metalness: 0.1,
        roughness: 0.8
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, -0.9, 0);
    scene.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25, -0.9, 0);
    scene.add(rightLeg);

    // Group all parts
    model = new THREE.Group();
    model.add(torso, head, leftArm, rightArm, leftLeg, rightLeg);
    scene.add(model);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Slow rotation for the mannequin
    if (model) {
        model.rotation.y += 0.002;
        // Subtle breathing effect
        model.position.y = Math.sin(Date.now() * 0.001) * 0.02;
    }

    renderer.render(scene, camera);
}

// Initialize the hero section when DOM is loaded
document.addEventListener('DOMContentLoaded', initHero);