/**
 * Oxomsoft Hero 3D Interactive Three.js Animation
 * Creates a futuristic neon particle constellation & reactive geometric core.
 */

(function () {
  const container = document.getElementById('hero-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 35;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group to rotate together
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // 1. Central Geometric Core (Icosahedron Wireframe + Inner Solid Glow)
  const icosahedronGeo = new THREE.IcosahedronGeometry(9, 1);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const coreMesh = new THREE.Mesh(icosahedronGeo, wireframeMat);
  mainGroup.add(coreMesh);

  // Inner Torus Ring (Nested Orbital)
  const torusGeo = new THREE.TorusGeometry(12, 0.4, 16, 100);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const torusMesh = new THREE.Mesh(torusGeo, torusMat);
  torusMesh.rotation.x = Math.PI / 3;
  mainGroup.add(torusMesh);

  // 2. Surrounding Particle Field (Constellation)
  const particleCount = 750;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  const colorOptions = [
    new THREE.Color(0x38bdf8), // Cyan
    new THREE.Color(0x818cf8), // Indigo
    new THREE.Color(0xc084fc), // Purple
    new THREE.Color(0x2dd4bf), // Teal
  ];

  for (let i = 0; i < particleCount; i++) {
    // Distribute particles in a spherical / elliptical cloud
    const radius = 10 + Math.random() * 32;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    scales[i] = Math.random() * 2 + 1;

    const chosenColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i * 3] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material
  const particleMat = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  mainGroup.add(particleSystem);

  // Mouse Interaction Variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function onPointerMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.0008;
    mouseY = (event.clientY - windowHalfY) * 0.0008;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Responsive Resize
  function onWindowResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', onWindowResize);

  // Animation Loop with Clock
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Subtle continuous rotation
    coreMesh.rotation.x = elapsedTime * 0.15;
    coreMesh.rotation.y = elapsedTime * 0.2;

    torusMesh.rotation.y = -elapsedTime * 0.18;
    torusMesh.rotation.z = elapsedTime * 0.12;

    particleSystem.rotation.y = elapsedTime * 0.05;
    particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

    // Smooth Mouse Reaction Lerping (Damping)
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    mainGroup.rotation.y = targetX * 1.5;
    mainGroup.rotation.x = targetY * 1.5;

    // Subtle pulsating scale
    const scalePulse = 1 + Math.sin(elapsedTime * 1.2) * 0.03;
    coreMesh.scale.set(scalePulse, scalePulse, scalePulse);

    renderer.render(scene, camera);
  }

  animate();
})();
