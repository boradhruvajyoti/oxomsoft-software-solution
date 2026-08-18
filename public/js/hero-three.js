/**
 * Oxomsoft Hero 3D Interactive Three.js Cinematic Animation
 * Renders a futuristic quantum nexus with multi-ring orbitals, glowing energy nodes,
 * and an interactive dynamic particle constellation reacting to mouse cursor velocity.
 */

(function () {
  const container = document.getElementById('hero-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene, Camera, High-Performance WebGL Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 38;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Master Group for 3D Interactive Parallax
  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // 1. Central Holographic Quantum Core (Geodesic Sphere + Pulsing Inner Diamond)
  const coreGroup = new THREE.Group();
  masterGroup.add(coreGroup);

  // Outer Icosahedron Wireframe
  const outerGeo = new THREE.IcosahedronGeometry(7.5, 2);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  coreGroup.add(outerMesh);

  // Inner Geometric Gem
  const innerGeo = new THREE.OctahedronGeometry(4.2, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerMesh);

  // 2. Multi-tier Orbital Gimbal Rings (Triple Gyro Rings)
  const ring1Geo = new THREE.TorusGeometry(11.5, 0.15, 16, 120);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3;
  masterGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(14.2, 0.12, 16, 120);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.35,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 4;
  masterGroup.add(ring2);

  const ring3Geo = new THREE.TorusGeometry(17, 0.1, 16, 120);
  const ring3Mat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity: 0.25,
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.z = Math.PI / 6;
  masterGroup.add(ring3);

  // 3. Cosmic Particle Constellation (800 dynamic luminous points)
  const particleCount = 650;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  const palette = [
    new THREE.Color(0x38bdf8), // Electric Cyan
    new THREE.Color(0x818cf8), // Neon Indigo
    new THREE.Color(0xc084fc), // Radiant Purple
    new THREE.Color(0x2dd4bf), // Bright Teal
    new THREE.Color(0x3b82f6), // Pure Blue
  ];

  for (let i = 0; i < particleCount; i++) {
    const radius = 10 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    scales[i] = Math.random() * 2.5 + 0.8;

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom soft particle point canvas texture
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(56,189,248,0.8)');
    grad.addColorStop(0.8, 'rgba(99,102,241,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  const particleMat = new THREE.PointsMaterial({
    size: 1.1,
    vertexColors: true,
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  masterGroup.add(particleSystem);

  // 4. Subtle Interconnecting Constellation Lines
  const lineCount = 35;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineCount * 2 * 3);

  for (let i = 0; i < lineCount * 2; i += 2) {
    const idx1 = Math.floor(Math.random() * (particleCount - 1));
    const idx2 = (idx1 + 1 + Math.floor(Math.random() * 5)) % particleCount;

    linePositions[i * 3] = positions[idx1 * 3];
    linePositions[i * 3 + 1] = positions[idx1 * 3 + 1];
    linePositions[i * 3 + 2] = positions[idx1 * 3 + 2];

    linePositions[(i + 1) * 3] = positions[idx2 * 3];
    linePositions[(i + 1) * 3 + 1] = positions[idx2 * 3 + 1];
    linePositions[(i + 1) * 3 + 2] = positions[idx2 * 3 + 2];
  }

  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
  });
  const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
  masterGroup.add(constellationLines);

  // Mouse Interaction Variables & Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function onPointerMove(e) {
    mouseX = (e.clientX - windowHalfX) * 0.0006;
    mouseY = (e.clientY - windowHalfY) * 0.0006;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Responsive Resize
  function onWindowResize() {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onWindowResize);

  // Animation Loop with Smooth Clock & Dampening
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    // Continuous celestial orbital rotations
    coreGroup.rotation.x = t * 0.12;
    coreGroup.rotation.y = t * 0.18;

    ring1.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.15;
    ring1.rotation.y = t * 0.15;

    ring2.rotation.y = Math.PI / 4 + Math.cos(t * 0.25) * 0.15;
    ring2.rotation.z = -t * 0.12;

    ring3.rotation.z = Math.PI / 6 + Math.sin(t * 0.2) * 0.1;
    ring3.rotation.x = t * 0.08;

    particleSystem.rotation.y = t * 0.04;
    particleSystem.rotation.x = Math.sin(t * 0.08) * 0.08;

    constellationLines.rotation.y = t * 0.04;
    constellationLines.rotation.x = Math.sin(t * 0.08) * 0.08;

    // Smooth Spring / Lerp Target Interpolation
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    masterGroup.rotation.y = targetX * 1.8;
    masterGroup.rotation.x = targetY * 1.8;

    // Harmonious Energy Core Pulse
    const pulse = 1 + Math.sin(t * 1.5) * 0.04;
    outerMesh.scale.set(pulse, pulse, pulse);
    innerMesh.scale.set(1 / pulse, 1 / pulse, 1 / pulse);

    renderer.render(scene, camera);
  }

  animate();
})();

