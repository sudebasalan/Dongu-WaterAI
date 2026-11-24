/**
 * DÖNGÜ — Gelişmiş Three.js 3D Sahnesi
 * Su sayacı + sensör + data paketleri + 3D telefon + Wilo akıllı pompa & filtre arıtma döngüsü
 * Serbest fare (drag / orbit) etkileşimi destekli
 */
import * as THREE from 'three';

// ── Yardımcı: lerp fonksiyonu ──────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }

export class WaterMeterScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.animFrameId = null;
    this.clock = new THREE.Clock();
    this.currentStep = 0;
    this.particles = [];
    this.wifiRings = [];
    this.dataPackets = [];
    this.graywaterParticles = [];
    this.gwBubbles = [];
    this.treatElements = [];
    this.sinkElements = [];
    this.led = null;
    this.ledLight = null;
    this.phone3D = null;
    this.screenPlane = null;
    this._camLookAt = new THREE.Vector3();
    this.targetCameraPos = new THREE.Vector3(3, 1, 5);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.flowSpeed = 0.3;
    this.userOrbit = { x: 0, y: 0 };
    this.isDragging = false;
    this.isWebGLAvailable = this._checkWebGL();
    this.isMobile = window.innerWidth < 768;
  }

  _checkWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch { return false; }
  }

  init() {
    if (!this.isWebGLAvailable) return false;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060f1a, 0.055);

    this.camera = new THREE.PerspectiveCamera(
      42, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 100
    );
    this.camera.position.set(3, 1.5, 6);
    this._camLookAt.set(0, 0, 0);

    this._buildLights();
    this._buildMeter();
    this._buildSensor();
    this._buildParticles();
    this._buildWifiRings();
    this._buildDataPackets();
    this._buildPhone3D();
    this._buildNeuralNet();
    this._buildGraywaterLoop();
    this._buildEnvironment();
    this._initInteraction();
    this._startLoop();

    window.addEventListener('resize', this._onResize.bind(this));
    return true;
  }

  // ── Fare / Dokunmatik İle 360° Serbest Döndürme Etkileşimi ────────────────
  _initInteraction() {
    let prevX = 0, prevY = 0;
    this.canvas.style.cursor = 'grab';

    this.canvas.addEventListener('pointerdown', e => {
      this.isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('pointermove', e => {
      if (!this.isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      this.userOrbit.y += dx * 0.0055;
      this.userOrbit.x = Math.max(-0.45, Math.min(0.45, this.userOrbit.x + dy * 0.005));
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
    });

    window.addEventListener('pointerleave', () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
    });
  }

  // ── Işıklandırma ───────────────────────────────────────────────────────────
  _buildLights() {
    this.scene.add(new THREE.AmbientLight(0x0d2f4a, 0.9));

    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(6, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -6;
    sun.shadow.camera.left = -6;
    sun.shadow.camera.right = 6;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x0FA3B1, 0.6);
    fill.position.set(-5, 2, -4);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0x1a6a8a, 0.4);
    rim.position.set(0, -2, -5);
    this.scene.add(rim);

    this.tealPoint = new THREE.PointLight(0x0FA3B1, 1.2, 10);
    this.tealPoint.position.set(0, 2, 2);
    this.scene.add(this.tealPoint);

    this.ledPointLight = new THREE.PointLight(0x00ff88, 0, 1.5);
    this.scene.add(this.ledPointLight);
  }

  // ── Su Sayacı ──────────────────────────────────────────────────────────────
  _buildMeter() {
    this.meterGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xC6903A, metalness: 0.85, roughness: 0.25, envMapIntensity: 0.8,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.3, 32), bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    this.meterGroup.add(body);

    const capMat = new THREE.MeshStandardMaterial({ color: 0xA07020, metalness: 0.9, roughness: 0.2 });
    [-0.65, 0.65].forEach(y => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.06, 32), capMat);
      cap.position.y = y;
      this.meterGroup.add(cap);
    });

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.95, roughness: 0.15 });
    const frameRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 48), frameMat);
    frameRing.rotation.x = Math.PI / 2;
    frameRing.position.y = 0.66;
    this.meterGroup.add(frameRing);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88ddee, metalness: 0.0, roughness: 0.0, transparent: true, opacity: 0.45, side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.03, 32), glassMat);
    glass.position.y = 0.68;
    this.meterGroup.add(glass);

    const digitMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.9 });
    const digitBgMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.95 });
    const bgBar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.11, 0.01), digitBgMat);
    bgBar.position.set(0, 0.675, 0.41);
    this.meterGroup.add(bgBar);
    this.digits = [];
    for (let i = 0; i < 5; i++) {
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.085, 0.015), digitMat.clone());
      d.position.set(-0.16 + i * 0.08, 0.675, 0.42);
      this.meterGroup.add(d);
      this.digits.push(d);
    }

    const needleMat = new THREE.MeshStandardMaterial({ color: 0xDD2222, emissive: 0x880000, emissiveIntensity: 0.3 });
    this.needle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.3, 0.015), needleMat);
    this.needle.position.set(0, 0.72, 0.42);
    this.needle.geometry.translate(0, 0.1, 0);
    this.meterGroup.add(this.needle);

    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x2255AA, metalness: 0.75, roughness: 0.3 });
    this.pipeL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 20), pipeMat);
    this.pipeL.rotation.z = Math.PI / 2;
    this.pipeL.position.set(-1.1, 0, 0);
    this.pipeL.castShadow = true;
    this.meterGroup.add(this.pipeL);
    this.pipeR = this.pipeL.clone();
    this.pipeR.position.set(1.1, 0, 0);
    this.meterGroup.add(this.pipeR);

    const nipleMat = new THREE.MeshStandardMaterial({ color: 0xC6903A, metalness: 0.9, roughness: 0.2 });
    [-0.52, 0.52].forEach(x => {
      const n = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 20), nipleMat);
      n.rotation.z = Math.PI / 2;
      n.position.set(x, 0, 0);
      this.meterGroup.add(n);
    });

    this.meterHighlight = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.025, 8, 64),
      new THREE.MeshStandardMaterial({
        color: 0x0FA3B1, emissive: 0x0FA3B1, emissiveIntensity: 2,
        transparent: true, opacity: 0,
      })
    );
    this.meterHighlight.rotation.x = Math.PI / 2;

    this.meterGroup.position.y = -0.1;
    this.scene.add(this.meterGroup);
    this.scene.add(this.meterHighlight);
    this.meterHighlight.position.y = -0.1;
  }

  // ── Sensör Modülü ──────────────────────────────────────────────────────────
  _buildSensor() {
    this.sensorGroup = new THREE.Group();

    const boardMat = new THREE.MeshStandardMaterial({ color: 0x1a4a1a, metalness: 0.3, roughness: 0.75 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.055, 0.38), boardMat);
    board.castShadow = true;
    this.sensorGroup.add(board);

    const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.6 });
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.14), chipMat);
    chip.position.set(-0.05, 0.05, 0);
    this.sensorGroup.add(chip);

    const chipLabel = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.002, 0.07),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 })
    );
    chipLabel.position.set(-0.05, 0.075, 0);
    this.sensorGroup.add(chipLabel);

    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 3,
      transparent: true, opacity: 0.95,
    });
    this.led = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), ledMat);
    this.led.position.set(0.2, 0.065, 0.12);
    this.sensorGroup.add(this.led);

    this.ledPointLight.position.set(0.2, 0.3, 0.12);

    const antMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.85, roughness: 0.2 });
    const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 8), antMat);
    antBase.position.set(0.22, 0.2, -0.14);
    this.sensorGroup.add(antBase);
    const antTop = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), antMat);
    antTop.position.set(0.22, 0.345, -0.14);
    this.sensorGroup.add(antTop);

    this.sensorGroup.position.set(0, 0.5, 0.52);
    this.sensorGroup.rotation.x = -0.1;
    this.sensorGroup.visible = false;
    this.scene.add(this.sensorGroup);
  }

  // ── Su Parçacıkları ────────────────────────────────────────────────────────
  _buildParticles() {
    this.particleGroup = new THREE.Group();
    const count = this.isMobile ? 40 : 80;
    const geo = new THREE.SphereGeometry(0.02, 5, 5);

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3DC8D6, emissive: 0x0FA3B1, emissiveIntensity: 0.4,
        transparent: true, opacity: 0.75,
      });
      const p = new THREE.Mesh(geo, mat);
      p.userData = {
        t: Math.random(),
        speed: 0.18 + Math.random() * 0.22,
        radOff: (Math.random() - 0.5) * 0.08,
        yOff: (Math.random() - 0.5) * 0.06,
      };
      this.particleGroup.add(p);
      this.particles.push(p);
    }
    this.scene.add(this.particleGroup);
  }

  // ── Wi-Fi Halkaları ───────────────────────────────────────────────────────
  _buildWifiRings() {
    this.wifiGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.09 + i * 0.09, 0.009, 8, 36),
        new THREE.MeshStandardMaterial({
          color: 0x0FA3B1, emissive: 0x0FA3B1, emissiveIntensity: 1,
          transparent: true, opacity: 0,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.userData.delay = i * 0.28;
      this.wifiRings.push(ring);
      this.wifiGroup.add(ring);
    }
    this.wifiGroup.position.set(0.22, 0.85, -0.02);
    this.wifiGroup.visible = false;
    this.scene.add(this.wifiGroup);
  }

  // ── Veri Paketleri ────────────────────────────────────────────────────────
  _buildDataPackets() {
    this.dataPacketGroup = new THREE.Group();
    const pkMat = new THREE.MeshStandardMaterial({
      color: 0x0FA3B1, emissive: 0x0FA3B1, emissiveIntensity: 0.8,
      transparent: true, opacity: 0,
    });
    for (let i = 0; i < 8; i++) {
      const pk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.04), pkMat.clone());
      pk.userData = {
        t: i / 8,
        speed: 0.25 + Math.random() * 0.1,
      };
      this.dataPacketGroup.add(pk);
      this.dataPackets.push(pk);
    }
    this.dataPacketGroup.visible = false;
    this.scene.add(this.dataPacketGroup);
  }

  // ── 3D Telefon ────────────────────────────────────────────────────────────
  _buildPhone3D() {
    this.phoneGroup = new THREE.Group();

    const phoneMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, metalness: 0.7, roughness: 0.25,
    });
    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.055), phoneMat);
    phoneBody.castShadow = true;
    this.phoneGroup.add(phoneBody);

    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x444466, metalness: 0.9, roughness: 0.1 });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.64, 1.14, 0.065), edgeMat);
    this.phoneGroup.add(edge);

    const phoneFront = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.055), phoneMat);
    phoneFront.position.z = 0.004;
    this.phoneGroup.add(phoneFront);

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628, emissive: 0x0d1f38, emissiveIntensity: 0.3, roughness: 0.05,
    });
    this.screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.95, 0.001), screenMat);
    this.screenMesh.position.z = 0.032;
    this.phoneGroup.add(this.screenMesh);

    const uiColors = [
      { color: 0x0FA3B1, pos: [-0.1, 0.3, 0.034], size: [0.2, 0.06, 0.001] },
      { color: 0x2E9E6B, pos: [0.1, 0.1, 0.034], size: [0.15, 0.08, 0.001] },
      { color: 0x1a4a73, pos: [-0.1, -0.05, 0.034], size: [0.3, 0.05, 0.001] },
      { color: 0xD1495B, pos: [0, -0.25, 0.034], size: [0.42, 0.14, 0.001] },
      { color: 0x0FA3B1, pos: [-0.15, 0.17, 0.034], size: [0.08, 0.04, 0.001] },
      { color: 0x0FA3B1, pos: [-0.05, 0.17, 0.034], size: [0.08, 0.06, 0.001] },
      { color: 0x0FA3B1, pos: [0.05, 0.17, 0.034], size: [0.08, 0.03, 0.001] },
      { color: 0x0FA3B1, pos: [0.15, 0.17, 0.034], size: [0.08, 0.07, 0.001] },
    ];
    this.screenUIElements = [];
    uiColors.forEach(u => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...u.size),
        new THREE.MeshStandardMaterial({
          color: u.color, emissive: u.color, emissiveIntensity: 0.5,
          transparent: true, opacity: 0,
        })
      );
      mesh.position.set(...u.pos);
      this.phoneGroup.add(mesh);
      this.screenUIElements.push(mesh);
    });

    this.screenGlow = new THREE.PointLight(0x0FA3B1, 0, 2);
    this.screenGlow.position.set(0, 0, 0.5);
    this.phoneGroup.add(this.screenGlow);

    this.phoneGroup.position.set(2.2, 0, 0);
    this.phoneGroup.rotation.y = -0.4;
    this.phoneGroup.visible = false;
    this.scene.add(this.phoneGroup);
  }

  // ── Sinir Ağı ─────────────────────────────────────────────────────────────
  _buildNeuralNet() {
    this.neuralGroup = new THREE.Group();
    this.neuralNodes = [];
    this.neuralLines = [];
    this.deviceIcons = [];

    const nodeMat = () => new THREE.MeshStandardMaterial({
      color: 0x0FA3B1, emissive: 0x0FA3B1, emissiveIntensity: 0.4,
      transparent: true, opacity: 0,
    });

    const layers = [
      { count: 3, x: -1.0 },
      { count: 5, x: 0 },
      { count: 3, x: 1.0 },
    ];
    const positions = [];

    layers.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        const y = (i - (layer.count - 1) / 2) * 0.42;
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), nodeMat());
        node.position.set(layer.x, y, 0);
        this.neuralGroup.add(node);
        this.neuralNodes.push(node);
        positions.push({ x: layer.x, y, li });
      }
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x0FA3B1, transparent: true, opacity: 0,
    });
    for (let a = 0; a < positions.length; a++) {
      for (let b = 0; b < positions.length; b++) {
        if (positions[b].li === positions[a].li + 1) {
          const pts = [
            new THREE.Vector3(positions[a].x, positions[a].y, 0),
            new THREE.Vector3(positions[b].x, positions[b].y, 0),
          ];
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            lineMat.clone()
          );
          this.neuralGroup.add(line);
          this.neuralLines.push(line);
        }
      }
    }

    const deviceColors = [0x0FA3B1, 0x2E9E6B, 0xEDAE49];
    positions.filter(p => p.li === 2).forEach((p, i) => {
      const label = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 12, 12),
        new THREE.MeshStandardMaterial({
          color: deviceColors[i], emissive: deviceColors[i], emissiveIntensity: 0.3,
          transparent: true, opacity: 0,
        })
      );
      label.position.set(p.x + 0.4, p.y, 0);
      this.neuralGroup.add(label);
      this.deviceIcons.push(label);
    });

    this.neuralGroup.scale.set(1.1, 1.1, 1.1);
    this.neuralGroup.visible = false;
    this.scene.add(this.neuralGroup);
  }

  // ── Ev → İlçe/Şehir Arıtma Tesisi → Şehre Geri Dönüş (Wilo pompalı) ─────
  _buildGraywaterLoop() {
    this.graywaterGroup = new THREE.Group();

    // 1. Ev (kullanılan su) — Sol
    const sourceGroup = new THREE.Group();
    const sourceMat = new THREE.MeshStandardMaterial({
      color: 0x1a4a6e, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0
    });
    this.gwSource = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.4), sourceMat);
    sourceGroup.add(this.gwSource);

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.1, transparent: true, opacity: 0 });
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 12), chromeMat);
    faucet.position.set(0, 0.3, 0);
    faucet.rotation.z = -0.3;
    sourceGroup.add(faucet);
    sourceGroup.position.set(-2.2, 0.6, 0);
    this.graywaterGroup.add(sourceGroup);

    // 2. İlçe/Şehir Arıtma Tesisi & Wilo Akıllı Pompa (Merkez)
    const treatGroup = new THREE.Group();

    const glassTankMat = new THREE.MeshStandardMaterial({
      color: 0x44bbaa, metalness: 0.1, roughness: 0.05,
      transparent: true, opacity: 0, depthWrite: false
    });
    this.gwTreat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.15, 32), glassTankMat);
    treatGroup.add(this.gwTreat);

    const sandMat = new THREE.MeshStandardMaterial({ color: 0xc4a36b, roughness: 0.9, transparent: true, opacity: 0 });
    const sandLayer = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.22, 24), sandMat);
    sandLayer.position.y = -0.36;
    treatGroup.add(sandLayer);

    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8, transparent: true, opacity: 0 });
    const carbonLayer = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.28, 24), carbonMat);
    carbonLayer.position.y = -0.1;
    treatGroup.add(carbonLayer);

    const uvMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2.0, transparent: true, opacity: 0
    });
    this.gwUVCore = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 16), uvMat);
    treatGroup.add(this.gwUVCore);

    this.gwUVLight = new THREE.PointLight(0xa855f7, 0, 2.5);
    treatGroup.add(this.gwUVLight);

    // Yükselen mikro kabarcıklar
    this.gwBubbles = [];
    const bubbleGeo = new THREE.SphereGeometry(0.018, 6, 6);
    const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    for (let i = 0; i < 14; i++) {
      const b = new THREE.Mesh(bubbleGeo, bubbleMat.clone());
      b.position.set((Math.random() - 0.5) * 0.28, -0.35 + Math.random() * 0.7, (Math.random() - 0.5) * 0.28);
      b.userData = { speed: 0.15 + Math.random() * 0.2, minY: -0.35, maxY: 0.4 };
      treatGroup.add(b);
      this.gwBubbles.push(b);
    }

    // Wilo Akıllı Pompa Motoru
    const wiloMat = new THREE.MeshStandardMaterial({ color: 0x0FA3B1, metalness: 0.8, roughness: 0.25, transparent: true, opacity: 0 });
    const pumpMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.38, 20), wiloMat);
    pumpMotor.rotation.z = Math.PI / 2;
    pumpMotor.position.set(0.65, -0.2, 0);
    treatGroup.add(pumpMotor);

    const ctrlMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.5, transparent: true, opacity: 0 });
    const pumpCtrl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.16), ctrlMat);
    pumpCtrl.position.set(0.65, 0.02, 0);
    treatGroup.add(pumpCtrl);

    this.pumpLED = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x2E9E6B, emissive: 0x2E9E6B, emissiveIntensity: 2, transparent: true, opacity: 0 })
    );
    this.pumpLED.position.set(0.65, 0.1, 0.08);
    treatGroup.add(this.pumpLED);

    // Tesisin arka sırasındaki ek arıtma havuzları (malzemeyi ana tankla paylaşır,
    // böylece aynı anda görünür/kaybolur)
    [[-0.95, -0.15, -0.65, 0.8], [0.15, -0.1, -1.05, 0.9], [1.2, -0.15, -0.7, 0.75]].forEach(([x, y, z, sc]) => {
      const tank = this.gwTreat.clone();
      tank.position.set(x, y, z);
      tank.scale.setScalar(sc);
      treatGroup.add(tank);
      const sand = sandLayer.clone();
      sand.position.set(x, y - 0.36 * sc, z);
      sand.scale.setScalar(sc);
      treatGroup.add(sand);
    });

    this.treatElements = [sandLayer, carbonLayer, this.gwUVCore, pumpMotor, pumpCtrl, this.pumpLED];
    treatGroup.position.set(0, -0.7, 0);
    this.graywaterGroup.add(treatGroup);

    // 3. Şehre geri dönüş: park / yeşil alan (Sağ)
    const sinkGroup = new THREE.Group();
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2E9E6B, metalness: 0.05, roughness: 0.8, transparent: true, opacity: 0 });
    this.gwSink = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.7), grassMat);
    this.gwSink.position.y = -0.3;
    sinkGroup.add(this.gwSink);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.9, transparent: true, opacity: 0 });
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x3fbf7f, roughness: 0.7, transparent: true, opacity: 0 });
    this.sinkElements = [];
    [[-0.25, 0.1], [0.22, -0.12]].forEach(([x, z]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 8), trunkMat);
      trunk.position.set(x, -0.1, z);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 12), crownMat);
      crown.position.set(x, 0.2, z);
      sinkGroup.add(trunk, crown);
      this.sinkElements.push(trunk, crown);
    });

    sinkGroup.position.set(2.2, 0.6, 0);
    this.graywaterGroup.add(sinkGroup);

    // Boru hatları
    const arrowMat = new THREE.LineBasicMaterial({ color: 0x2E9E6B, transparent: true, opacity: 0 });
    const makeLine = (from, to) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...from), new THREE.Vector3(...to)
      ]);
      const line = new THREE.Line(geo, arrowMat.clone());
      this.graywaterGroup.add(line);
      return line;
    };
    this.gwLines = [
      makeLine([-2.2, 0.4, 0], [0, -0.2, 0]),
      makeLine([0.65, -0.2, 0], [2.2, 0.3, 0]),
    ];

    // Su akış parçacıkları (ev → tesis → şehir)
    const gwMat = new THREE.MeshStandardMaterial({
      color: 0x2E9E6B, emissive: 0x1a7a4a, emissiveIntensity: 0.6,
      transparent: true, opacity: 0,
    });
    for (let i = 0; i < 24; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), gwMat.clone());
      p.userData = { t: i / 24, path: i < 12 ? 0 : 1 };
      this.graywaterGroup.add(p);
      this.graywaterParticles.push(p);
    }

    // Döngü halkası
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x2E9E6B, emissive: 0x2E9E6B, emissiveIntensity: 0.5,
      transparent: true, opacity: 0,
    });
    this.gwRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 8, 48), ringMat);
    this.gwRing.position.set(0, 0.35, 0.4);
    this.graywaterGroup.add(this.gwRing);

    this.gwGlow = new THREE.PointLight(0x2E9E6B, 0, 4);
    this.gwGlow.position.set(0, 0, 0.5);
    this.graywaterGroup.add(this.gwGlow);

    this.graywaterGroup.scale.setScalar(0.85);
    this.graywaterGroup.visible = false;
    this.scene.add(this.graywaterGroup);
  }

  // ── Zemin ve Ortam ────────────────────────────────────────────────────────
  _buildEnvironment() {
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060f1a, metalness: 0.3, roughness: 0.8,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const gridHelper = new THREE.GridHelper(20, 20, 0x0FA3B1, 0x0a2a3a);
    gridHelper.position.y = -1.49;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    this.scene.add(gridHelper);

    const bgGeo = new THREE.BufferGeometry();
    const bgCount = this.isMobile ? 60 : 150;
    const positions = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.bgParticles = new THREE.Points(bgGeo, new THREE.PointsMaterial({
      color: 0x0FA3B1, size: 0.025, transparent: true, opacity: 0.3,
    }));
    this.scene.add(this.bgParticles);
  }

  // ── Adım Kontrolü ─────────────────────────────────────────────────────────
  setStep(step) {
    this.currentStep = step;

    this.sensorGroup.visible = false;
    this.wifiGroup.visible = false;
    this.dataPacketGroup.visible = false;
    this.neuralGroup.visible = false;
    this.phoneGroup.visible = false;
    this.graywaterGroup.visible = false;
    this.meterGroup.visible = true;

    switch (step) {
      case 0:
        this.targetCameraPos.set(2.5, 0.5, 5.5);
        this.targetLookAt.set(0, -0.1, 0);
        this.flowSpeed = 0.45;
        this._setMeterHighlight(0.4);
        break;

      case 1:
        this.targetCameraPos.set(0.3, 1.0, 3.5);
        this.targetLookAt.set(0, 0.5, 0.5);
        this.flowSpeed = 0.3;
        this.sensorGroup.visible = true;
        this._setMeterHighlight(0.7);
        break;

      case 2:
        this.targetCameraPos.set(-1.5, 1.2, 4.5);
        this.targetLookAt.set(0, 0.5, 0);
        this.flowSpeed = 0.5;
        this.sensorGroup.visible = true;
        this.wifiGroup.visible = true;
        this.dataPacketGroup.visible = true;
        this._setMeterHighlight(0.3);
        break;

      case 3:
        this.targetCameraPos.set(0, 0.5, 6);
        this.targetLookAt.set(0, 0.1, 0);
        this.flowSpeed = 0.2;
        this.neuralGroup.visible = true;
        this._setMeterHighlight(0.1);
        break;

      case 4:
        this.targetCameraPos.set(2.5, 0.8, 4.5);
        this.targetLookAt.set(1.8, 0.3, 0);
        this.flowSpeed = 0.3;
        this.sensorGroup.visible = true;
        this.wifiGroup.visible = true;
        this.phoneGroup.visible = true;
        this.dataPacketGroup.visible = true;
        this._setMeterHighlight(0.2);
        break;

      case 5:
        // Ev → ilçe tesisi → şehir: sayaç gizlenir, tüm akış kadraja sığar
        this.targetCameraPos.set(0, 1.6, 9);
        this.targetLookAt.set(0, -0.1, 0);
        this.flowSpeed = 0.25;
        this.meterGroup.visible = false;
        this.graywaterGroup.visible = true;
        this._setMeterHighlight(0.1);
        break;
    }
  }

  _setMeterHighlight(opacity) {
    if (this.meterHighlight) this.meterHighlight.material.opacity = opacity;
  }

  // ── Render Döngüsü ─────────────────────────────────────────────────────────
  _startLoop() {
    const tick = () => {
      this.animFrameId = requestAnimationFrame(tick);
      this._update();
    };
    tick();
  }

  _update() {
    const t = this.clock.getElapsedTime();
    const DT = 0.016;

    // Serbest fare döndürmesi & yumuşak kamera takibi
    if (!this.isDragging) {
      this.userOrbit.x = lerp(this.userOrbit.x, 0, 0.025);
      this.userOrbit.y = lerp(this.userOrbit.y, 0, 0.025);
    }

    const dynamicTargetPos = this.targetCameraPos.clone();
    dynamicTargetPos.x += Math.sin(this.userOrbit.y) * 2.2;
    dynamicTargetPos.z += (Math.cos(this.userOrbit.y) - 1) * 2.2;
    dynamicTargetPos.y += this.userOrbit.x * 1.8;

    this.camera.position.lerp(dynamicTargetPos, 0.035);
    this._camLookAt.lerp(this.targetLookAt, 0.035);
    this.camera.lookAt(this._camLookAt);

    // Sayaç hafif salınımı
    if (this.meterGroup) {
      this.meterGroup.rotation.y = Math.sin(t * 0.25) * 0.04;
    }

    // İbre dönüşü
    if (this.needle) {
      this.needle.rotation.z = -this.flowSpeed * t * 2;
    }

    // Su parçacıkları
    this.particles.forEach(p => {
      p.userData.t = (p.userData.t + this.flowSpeed * DT) % 1;
      const pt = p.userData.t;
      if (pt < 0.45) {
        p.position.set(-1.6 + pt * (1.6 / 0.45), -0.1 + p.userData.yOff, p.userData.radOff);
      } else if (pt < 0.55) {
        p.position.set((pt - 0.5) * 2, -0.1 + p.userData.yOff, p.userData.radOff);
      } else {
        p.position.set((pt - 0.55) * (1.6 / 0.45), -0.1 + p.userData.yOff, p.userData.radOff);
      }
      const inPipe = pt < 0.1 || pt > 0.9;
      p.material.opacity = inPipe ? 0.3 : 0.75;
    });

    // Sensör LED yanıp sönmesi
    if (this.led && this.sensorGroup.visible) {
      const blink = (Math.sin(t * 4) + 1) / 2;
      this.led.material.emissiveIntensity = 2 + blink * 3;
      this.ledPointLight.intensity = blink * 1.0;
    } else if (this.led) {
      this.led.material.emissiveIntensity = 0.5;
      this.ledPointLight.intensity = 0;
    }

    // Wi-Fi halkaları
    if (this.wifiGroup.visible) {
      this.wifiRings.forEach((ring) => {
        const phase = ((t * 0.7 - ring.userData.delay * 0.6) % 1 + 1) % 1;
        ring.material.opacity = Math.max(0, (1 - phase) * 0.65);
        const sc = 1 + phase * 2;
        ring.scale.set(sc, sc, 1);
      });
    }

    // Veri paketleri (sensörden telefona)
    if (this.dataPacketGroup.visible) {
      const phonePos = this.phoneGroup.visible
        ? new THREE.Vector3(2.2, 0.3, 0)
        : new THREE.Vector3(3, 0.5, 0);
      const sensorPos = new THREE.Vector3(0.22, 0.85, 0.52);

      this.dataPackets.forEach(pk => {
        pk.userData.t = (pk.userData.t + 0.3 * DT) % 1;
        const pt = pk.userData.t;
        const mid = new THREE.Vector3(
          (sensorPos.x + phonePos.x) / 2,
          Math.max(sensorPos.y, phonePos.y) + 1.0,
          (sensorPos.z + phonePos.z) / 2
        );
        pk.position.lerpVectors(
          new THREE.Vector3().lerpVectors(sensorPos, mid, pt),
          new THREE.Vector3().lerpVectors(mid, phonePos, pt),
          pt
        );
        pk.material.opacity = Math.sin(pt * Math.PI) * 0.9;
        pk.rotation.y += 0.1;
      });
    }

    // Telefon animasyonu
    if (this.phoneGroup.visible) {
      this.phoneGroup.rotation.y = -0.4 + Math.sin(t * 0.4) * 0.08;
      this.phoneGroup.position.y = Math.sin(t * 0.6) * 0.06;

      this.screenUIElements.forEach((el) => {
        el.material.opacity = lerp(el.material.opacity, 0.75, 0.04);
      });
      this.screenGlow.intensity = 0.5 + Math.sin(t * 2) * 0.15;
      this.screenMesh.material.emissiveIntensity = 0.4 + Math.sin(t * 1.5) * 0.1;
    } else {
      this.screenUIElements.forEach(el => {
        el.material.opacity = lerp(el.material.opacity, 0, 0.1);
      });
    }

    // Sinir ağı animasyonu
    if (this.neuralGroup.visible) {
      this.neuralNodes.forEach((n, i) => {
        const phase = ((t * 0.6 + i * 0.4) % 1);
        n.material.opacity = lerp(n.material.opacity, 0.5 + phase * 0.5, 0.05);
        n.material.emissiveIntensity = 0.3 + phase * 0.7;
      });
      this.neuralLines.forEach((l, i) => {
        l.material.opacity = lerp(l.material.opacity, 0.15 + Math.abs(Math.sin(t * 2 + i * 0.5)) * 0.2, 0.05);
      });
      this.deviceIcons.forEach((d, i) => {
        const target = 0.6 + Math.sin(t * 1.5 + i) * 0.3;
        d.material.opacity = lerp(d.material.opacity, target, 0.04);
        d.material.emissiveIntensity = 0.3 + Math.sin(t + i) * 0.2;
        d.scale.setScalar(1 + Math.sin(t * 2 + i * 1.2) * 0.08);
      });
    } else {
      this.neuralNodes.forEach(n => { n.material.opacity = lerp(n.material.opacity, 0, 0.08); });
      this.neuralLines.forEach(l => { l.material.opacity = lerp(l.material.opacity, 0, 0.08); });
      this.deviceIcons.forEach(d => { d.material.opacity = lerp(d.material.opacity, 0, 0.08); });
    }

    // Arıtma & geri dönüş döngüsü, Wilo pompa animasyonu
    if (this.graywaterGroup.visible) {
      [this.gwSource, this.gwTreat, this.gwSink].forEach((m) => {
        m.material.opacity = lerp(m.material.opacity, 0.75, 0.03);
      });
      this.gwLines.forEach(l => { l.material.opacity = lerp(l.material.opacity, 0.6, 0.03); });
      this.gwRing.material.opacity = lerp(this.gwRing.material.opacity, 0.9, 0.03);
      this.gwRing.rotation.z = t * 0.8;
      this.gwGlow.intensity = lerp(this.gwGlow.intensity, 1.5, 0.03);

      if (this.treatElements) {
        this.treatElements.forEach(el => {
          el.material.opacity = lerp(el.material.opacity, 0.85, 0.04);
        });
      }
      if (this.sinkElements) {
        this.sinkElements.forEach(el => {
          el.material.opacity = lerp(el.material.opacity, 0.85, 0.04);
        });
      }

      // Yükselen mikro kabarcıklar
      this.gwBubbles.forEach(b => {
        b.position.y += b.userData.speed * DT;
        if (b.position.y > b.userData.maxY) b.position.y = b.userData.minY;
        b.material.opacity = lerp(b.material.opacity, 0.65, 0.04);
      });

      // UV lambası yanıp sönmesi
      if (this.gwUVLight) {
        this.gwUVLight.intensity = 1.2 + Math.sin(t * 4) * 0.4;
      }

      // Wilo Pompa LED'i
      if (this.pumpLED) {
        this.pumpLED.material.emissiveIntensity = 1.5 + Math.sin(t * 6) * 0.8;
      }

      // Gri su akış parçacıkları
      this.graywaterParticles.forEach(p => {
        p.userData.t = (p.userData.t + 0.2 * DT) % 1;
        const pt = p.userData.t;
        p.material.opacity = lerp(p.material.opacity, Math.sin(pt * Math.PI) * 0.85, 0.05);

        if (p.userData.path === 0) {
          p.position.set(
            lerp(-2.2, 0, pt),
            lerp(0.5, -0.4, pt),
            0
          );
        } else {
          p.position.set(
            lerp(0.65, 2.2, pt),
            lerp(-0.4, 0.5, pt),
            0
          );
        }
      });
    } else {
      [this.gwSource, this.gwTreat, this.gwSink].forEach(m => {
        m.material.opacity = lerp(m.material.opacity, 0, 0.05);
      });
      this.gwLines.forEach(l => { l.material.opacity = lerp(l.material.opacity, 0, 0.05); });
      this.gwRing.material.opacity = lerp(this.gwRing.material.opacity, 0, 0.05);
      this.gwGlow.intensity = lerp(this.gwGlow.intensity, 0, 0.05);
      this.graywaterParticles.forEach(p => {
        p.material.opacity = lerp(p.material.opacity, 0, 0.05);
      });
      if (this.treatElements) {
        this.treatElements.forEach(el => { el.material.opacity = lerp(el.material.opacity, 0, 0.05); });
      }
      if (this.sinkElements) {
        this.sinkElements.forEach(el => { el.material.opacity = lerp(el.material.opacity, 0, 0.05); });
      }
      this.gwBubbles.forEach(b => { b.material.opacity = lerp(b.material.opacity, 0, 0.05); });
    }

    if (this.tealPoint) {
      this.tealPoint.intensity = 0.8 + Math.sin(t * 1.2) * 0.3;
      this.tealPoint.position.x = Math.sin(t * 0.4) * 2;
    }

    if (this.bgParticles) {
      this.bgParticles.rotation.y = t * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('resize', this._onResize.bind(this));
  }
}
