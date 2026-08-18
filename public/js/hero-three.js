/**
 * Oxomsoft Hero 3D Interactive Three.js Experience
 * Ultra-smooth glowing 3D harmonic wave terrain & flowing digital cyber landscape.
 * Replaces rigid blocks with an organic, fluid undulating particle wave & stardust bokeh.
 */

(function () {
  const container = document.getElementById('hero-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene, Camera & Renderer Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07090e, 0.012);

  const getWidth = () => container.clientWidth || window.innerWidth;
  const getHeight = () => container.clientHeight || window.innerHeight;

  const camera = new THREE.PerspectiveCamera(50, getWidth() / getHeight(), 0.1, 1000);
  camera.position.set(0, 18, 38);
  camera.lookAt(0, -3, 0);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(getWidth(), getHeight());
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Soft glowing circular particle sprite (No square edges)
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(56, 189, 248, 0.95)');
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
  }

  const particleTexture = createParticleTexture();

  // ----------------------------------------------------
  // 1. Shared Harmonic Wave Geometry (Points + Smooth Wireframe)
  // ----------------------------------------------------
  const widthSegments = 80;
  const heightSegments = 50;
  const gridWidth = 110;
  const gridHeight = 70;

  const waveGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, widthSegments, heightSegments);
  waveGeo.rotateX(-Math.PI / 2); // Orient horizontally

  const posAttr = waveGeo.attributes.position;
  const vertexCount = posAttr.count;

  // Cache base X and Z coordinates
  const basePositions = new Float32Array(vertexCount * 2);
  for (let i = 0; i < vertexCount; i++) {
    basePositions[i * 2] = posAttr.getX(i);
    basePositions[i * 2 + 1] = posAttr.getZ(i);
  }

  // Color attribute for smooth gradient waves
  const colors = new Float32Array(vertexCount * 3);
  const colTrough = new THREE.Color(0x312e81); // Deep Indigo
  const colMid = new THREE.Color(0x0284c7);    // Vivid Sky Blue
  const colCrest = new THREE.Color(0x38bdf8);  // Electric Cyan
  const colPeak = new THREE.Color(0xc084fc);   // Neon Purple Glow

  for (let i = 0; i < vertexCount; i++) {
    colors[i * 3] = colMid.r;
    colors[i * 3 + 1] = colMid.g;
    colors[i * 3 + 2] = colMid.b;
  }
  waveGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Luminous Glowing Points Layer
  const wavePointsMat = new THREE.PointsMaterial({
    size: 1.45,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const wavePoints = new THREE.Points(waveGeo, wavePointsMat);
  wavePoints.position.y = -7;
  scene.add(wavePoints);

  // Subtle Smooth Wireframe Lattice Underlay
  const waveWireframeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
  });
  const waveWireframe = new THREE.Mesh(waveGeo, waveWireframeMat);
  waveWireframe.position.y = -7.05;
  scene.add(waveWireframe);

  // ----------------------------------------------------
  // 2. Floating Ambient Bokeh Stardust
  // ----------------------------------------------------
  const stardustCount = 280;
  const stardustGeo = new THREE.BufferGeometry();
  const stardustPos = new Float32Array(stardustCount * 3);
  const stardustVel = [];

  for (let i = 0; i < stardustCount; i++) {
    stardustPos[i * 3] = (Math.random() - 0.5) * 110;
    stardustPos[i * 3 + 1] = (Math.random() - 0.5) * 40 + 6;
    stardustPos[i * 3 + 2] = (Math.random() - 0.5) * 70;

    stardustVel.push({
      speedY: 0.02 + Math.random() * 0.025,
      phase: Math.random() * Math.PI * 2,
    });
  }

  stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPos, 3));

  const stardustMat = new THREE.PointsMaterial({
    size: 1.1,
    map: particleTexture,
    color: 0x818cf8,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const stardustSystem = new THREE.Points(stardustGeo, stardustMat);
  scene.add(stardustSystem);

  // ----------------------------------------------------
  // 3. Interactive Cursor & Fluid Ripple
  // ----------------------------------------------------
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  function onPointerMove(event) {
    const rect = container.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    targetMouseX = nx;
    targetMouseY = ny;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Responsive Resize
  function onWindowResize() {
    if (!container) return;
    const w = getWidth();
    const h = getHeight();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onWindowResize);

  // ----------------------------------------------------
  // 4. Smooth Animation Loop
  // ----------------------------------------------------
  const clock = new THREE.Clock();
  const tempColor = new THREE.Color();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Smooth Cursor Lerp
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    // Smooth Camera Gentle Parallax
    camera.position.x = mouseX * 7;
    camera.position.y = 18 + mouseY * 3.5;
    camera.lookAt(0, -3, 0);

    // Wave ripple calculation
    const worldMouseX = mouseX * 38;
    const worldMouseZ = -mouseY * 22;

    const currentPos = waveGeo.attributes.position;
    const currentCol = waveGeo.attributes.color;

    for (let i = 0; i < vertexCount; i++) {
      const x = basePositions[i * 2];
      const z = basePositions[i * 2 + 1];

      // Multi-harmonic gentle organic sine waves
      const wave1 = Math.sin(x * 0.08 + time * 0.9) * 3.2;
      const wave2 = Math.cos(z * 0.09 + time * 0.7) * 2.4;
      const wave3 = Math.sin((x * 0.05 + z * 0.06) + time * 1.1) * 1.8;

      // Soft interactive mouse elevation
      const dx = x - worldMouseX;
      const dz = z - worldMouseZ;
      const distSq = dx * dx + dz * dz;
      const mouseRipple = Math.exp(-distSq / 150) * 5.0;

      const y = wave1 + wave2 + wave3 + mouseRipple;

      currentPos.setY(i, y);

      // Height-based smooth gradient blending
      const normHeight = Math.max(0, Math.min(1, (y + 5.5) / 13.5));

      if (normHeight < 0.4) {
        tempColor.copy(colTrough).lerp(colMid, normHeight / 0.4);
      } else if (normHeight < 0.8) {
        tempColor.copy(colMid).lerp(colCrest, (normHeight - 0.4) / 0.4);
      } else {
        tempColor.copy(colCrest).lerp(colPeak, (normHeight - 0.8) / 0.2);
      }

      currentCol.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
    }

    currentPos.needsUpdate = true;
    currentCol.needsUpdate = true;

    // Animate Floating Stardust
    const starPositions = stardustGeo.attributes.position;
    for (let i = 0; i < stardustCount; i++) {
      let py = starPositions.getY(i) + stardustVel[i].speedY;
      let px = starPositions.getX(i) + Math.sin(time + stardustVel[i].phase) * 0.015;

      if (py > 28) py = -12;

      starPositions.setY(i, py);
      starPositions.setX(i, px);
    }
    starPositions.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
})();
