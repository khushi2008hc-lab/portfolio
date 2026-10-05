/**
 * Three.js 3D Interactive Cosmos & Floating Geometry Scene
 * Full WebGL 3D experience with cursor parallax, rotating geometry & particle matrix
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Check if THREE is defined
  if (typeof THREE === 'undefined') {
    initCanvasFallback(canvas);
    return;
  }

  try {
    initThreeScene();
  } catch (e) {
    console.warn('WebGL initialization failed, using canvas fallback:', e);
    initCanvasFallback(canvas);
  }

  function initThreeScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 85;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Color definitions
    let currentColor = 0x00f5d4;

    // 1. Particle Cosmos (Stars / Code dust)
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(currentColor);
    const secondaryColor = new THREE.Color(0x7928ca);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 220;
      positions[i + 1] = (Math.random() - 0.5) * 220;
      positions[i + 2] = (Math.random() - 0.5) * 220;

      // Color interpolation
      const mixedColor = baseColor.clone().lerp(secondaryColor, Math.random());
      colors[i] = mixedColor.r;
      colors[i + 1] = mixedColor.g;
      colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular particle texture via canvas
    const particleMaterial = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 2. Floating 3D Wireframe Icosahedrons
    const icoGroup = new THREE.Group();

    // Central aesthetic wireframe
    const icoGeo1 = new THREE.IcosahedronGeometry(18, 1);
    const icoMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const icoMesh1 = new THREE.Mesh(icoGeo1, icoMat1);
    icoMesh1.position.set(45, 10, -20);
    icoGroup.add(icoMesh1);

    // Inner orbiting torus
    const torusGeo = new THREE.TorusGeometry(26, 0.4, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x7928ca,
      transparent: true,
      opacity: 0.25
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(45, 10, -20);
    torusMesh.rotation.x = Math.PI / 4;
    icoGroup.add(torusMesh);

    // Left decorative floating octahedron
    const octGeo = new THREE.OctahedronGeometry(12, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.14
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(-50, -25, -30);
    icoGroup.add(octMesh);

    scene.add(icoGroup);

    // 3. Mouse Parallax & Inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    window.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.04;
      mouseY = (event.clientY - windowHalfY) * 0.04;
    }, { passive: true });

    // Scroll tracking
    let scrollY = 0;
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY * 0.05;
    }, { passive: true });

    // Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Theme color listener
    window.addEventListener('themeChanged', (e) => {
      const themeColors = {
        cyan: 0x00f5d4,
        purple: 0xa855f7,
        pink: 0xff007f,
        emerald: 0x10b981
      };
      const col = themeColors[e.detail.theme] || 0x00f5d4;
      icoMat1.color.setHex(col);
      octMat.color.setHex(col);
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = -targetY - scrollY;
      camera.lookAt(scene.position);

      // Rotate particles slowly
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0003;

      // Rotate geometric meshes
      icoMesh1.rotation.x += 0.004;
      icoMesh1.rotation.y += 0.005;

      torusMesh.rotation.y += 0.006;
      torusMesh.rotation.z += 0.003;

      octMesh.rotation.x += 0.003;
      octMesh.rotation.z += 0.004;

      renderer.render(scene, camera);
    }

    animate();
  }

  // Fallback 2D Canvas Interactive Constellation if WebGL is disabled
  function initCanvasFallback(canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const dots = [];
    const count = Math.floor((width * height) / 12000);

    for (let i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#00f5d4';
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.12)';

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }
})();
