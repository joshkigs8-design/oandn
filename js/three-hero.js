// ============================================
// O & N FITS - Three.js Hero Scene
// 3D Animated Background
// ============================================

let scene, camera, renderer, objects = [];

function initThreeHero() {
    const container = document.getElementById('three-container');
    if (!container) return;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x98FF98);

    // Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x98FF98, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create 3D objects
    createGeometries();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Animation loop
    animate();
}

function createGeometries() {
    // Create luxury geometric shapes
    
    // Gold cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.2
    });
    const cube = new THREE.Mesh(cubeGeometry, goldMaterial);
    cube.position.set(-2, 1, 0);
    cube.rotation.set(0.5, 0.5, 0.5);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    objects.push({ mesh: cube, rotationSpeed: 0.005 });

    // Sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(0.8, 4);
    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.6,
        roughness: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeometry, darkMaterial);
    sphere.position.set(1.5, 0.5, -1);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    objects.push({ mesh: sphere, rotationSpeed: 0.003 });

    // Torus
    const torusGeometry = new THREE.TorusGeometry(1.2, 0.3, 16, 100);
    const charcoalMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d2d,
        metalness: 0.7,
        roughness: 0.3
    });
    const torus = new THREE.Mesh(torusGeometry, charcoalMaterial);
    torus.position.set(0, -1, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);
    objects.push({ mesh: torus, rotationSpeed: 0.002 });

    // Octahedron
    const octaGeometry = new THREE.OctahedronGeometry(0.7, 2);
    const octaMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8c547,
        metalness: 0.9,
        roughness: 0.1
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    octahedron.position.set(-1, -1.2, -0.5);
    octahedron.castShadow = true;
    octahedron.receiveShadow = true;
    scene.add(octahedron);
    objects.push({ mesh: octahedron, rotationSpeed: 0.004 });
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate objects
    objects.forEach(obj => {
        obj.mesh.rotation.x += obj.rotationSpeed;
        obj.mesh.rotation.y += obj.rotationSpeed;
        obj.mesh.position.y += Math.sin(Date.now() * 0.0005) * 0.002;
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('three-container');
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeHero);
} else {
    initThreeHero();
} 
        color: 0xffd700,
        metalic: 0.3,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    scene.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        metalic: 0.1,
        roughness: 0.3
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    scene.add(head);

    // Simple arms (optional)
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 32);
    const armMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalic: 0.3,
        roughness: 0.4
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 0.3, 0);
    leftArm.rotation.z = Math.PI / 6;
    scene.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 6;
    scene.add(rightArm);

    // Simple legs (optional)
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 32);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalic: 0.3,
        roughness: 0.4
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -1.2, 0);
    scene.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -1.2, 0);
    scene.add(rightLeg);

    // Group all parts for easy manipulation
    mannequin = new THREE.Group();
    mannequin.add(body, head, leftArm, rightArm, leftLeg, rightLeg);
    scene.add(mannequin);
}

function createParticles() {
    // Create a simple particle system for floating elements
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color = new THREE.Color(0xffd700);

    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        // Color
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate the mannequin slowly
    if (mannequin) {
        mannequin.rotation.y += 0.005;
        // Add a subtle up/down movement
        mannequin.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }

    // Move particles slowly
    // (We would update particle positions here if we wanted them to move)
    // For now, we'll just render

    renderer.render(scene, camera);
}

// Initialize the Three.js hero when the DOM is loaded
document.addEventListener('DOMContentLoaded', initThreeHero);