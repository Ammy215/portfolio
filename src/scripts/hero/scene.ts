// Layered-defense hero. Rings are defense layers (outermost = first contact, centre = correlation).
// On load, one orchestrated sequence: noise drifts in, each layer catches a share of it,
// caught packets turn into signal and flow into that layer's project. Then the scene idles.
// Labels are real <a> elements positioned over the canvas, so they stay keyboard/screen-reader usable.
import * as THREE from 'three';
import { layers, nodes, hubs, type Channel } from '../../data/graph';

interface Options {
  canvas: HTMLCanvasElement;
  labels: HTMLElement; // container holding <a data-slug="..."> elements
  reducedMotion: boolean;
}

const css = getComputedStyle(document.documentElement);
const token = (name: string) => new THREE.Color(css.getPropertyValue(name).trim());
const COLORS = {
  ink: token('--ink'),
  noise: token('--noise'),
  signal: token('--signal'),
  link: token('--link'),
  alert: token('--alert'),
  glowSignal: token('--glow-signal'),
  glowLink: token('--glow-link'),
};
const channelColor = (c: Channel) => (c === 'signal' ? COLORS.signal : COLORS.link);

const LAYER_COUNT = layers.length;
const ringRadius = (i: number) => 0.9 + (LAYER_COUNT - 1 - i) * 0.95;
const ringHeight = (i: number) => i * 0.3;

const SEQUENCE_MS = 2600;
const PARTICLES = 1400;
const PASS_RATE = 0.62; // share of traffic that gets past each layer

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function initHero({ canvas, labels, reducedMotion }: Options) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const camBase = new THREE.Vector3(0, 12, 15.5);
  const lookAt = new THREE.Vector3(0, 0.3, 0);
  camera.position.copy(camBase);
  camera.lookAt(lookAt);

  const world = new THREE.Group();
  scene.add(world);

  // --- Layers: terraced rings -------------------------------------------------
  layers.forEach((_, i) => {
    const r = ringRadius(i);
    const y = ringHeight(i);
    const pts = new THREE.EllipseCurve(0, 0, r, r).getPoints(160).map((p) => new THREE.Vector3(p.x, y, p.y));
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0.22 })
    );
    world.add(line);
    const disc = new THREE.Mesh(
      new THREE.RingGeometry(i === LAYER_COUNT - 1 ? 0 : ringRadius(i + 1), r, 96),
      new THREE.MeshBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0.025 + i * 0.006, side: THREE.DoubleSide, depthWrite: false })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = y;
    world.add(disc);
  });

  // --- Project nodes: small voxels (echo of the pixel-art identity) -------------
  const nodePos = new Map<string, THREE.Vector3>();
  const nodeMesh = new Map<string, THREE.Mesh>();
  nodes.forEach((n, idx) => {
    const li = layers.findIndex((l) => l.id === n.layer);
    const r = ringRadius(li);
    const isCentre = li === LAYER_COUNT - 1;
    const angle = -Math.PI * 0.62 + idx * 1.05; // spiral so labels don't stack
    const pos = isCentre
      ? new THREE.Vector3(0, ringHeight(li) + 0.2, 0)
      : new THREE.Vector3(Math.cos(angle) * r, ringHeight(li) + 0.14, Math.sin(angle) * r);
    nodePos.set(n.slug, pos);

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.26, 0.26),
      new THREE.MeshBasicMaterial({ color: n.inProgress ? COLORS.alert : channelColor(n.channel) })
    );
    mesh.position.copy(pos);
    mesh.rotation.y = Math.PI / 4;
    world.add(mesh);
    nodeMesh.set(n.slug, mesh);
  });

  // --- Hubs: shared-dependency arcs --------------------------------------------
  const hubCurves: { hub: string; a: string; b: string; curve: THREE.QuadraticBezierCurve3; mat: THREE.LineBasicMaterial }[] = [];
  hubs.forEach((hub, hi) => {
    for (let i = 0; i < hub.projects.length - 1; i++) {
      const a = nodePos.get(hub.projects[i])!;
      const b = nodePos.get(hub.projects[i + 1])!;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 1.6 + hi * 0.45;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const mat = new THREE.LineBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0 });
      world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), mat));
      hubCurves.push({ hub: hub.id, a: hub.projects[i], b: hub.projects[i + 1], curve, mat });
    }
  });

  // --- Particles: noise → caught at a layer → signal into that layer's node -------
  const nodeByLayer = new Map(nodes.map((n) => [n.layer, n]));
  const pos = new Float32Array(PARTICLES * 3);
  const col = new Float32Array(PARTICLES * 3);
  const alpha = new Float32Array(PARTICLES);
  const P = Array.from({ length: PARTICLES }, () => {
    let stop = 0;
    while (stop < LAYER_COUNT - 1 && Math.random() < PASS_RATE) stop++;
    const node = nodeByLayer.get(layers[stop].id)!;
    return {
      theta: Math.random() * Math.PI * 2,
      r0: ringRadius(0) + 1.2 + Math.random() * 3,
      y0: -0.4 + Math.random() * 0.6,
      stop,
      delay: Math.random() * 0.45,
      // only a share of caught traffic is "detected" and flows to the node; the rest is dropped
      detected: Math.random() < 0.35,
      target: nodePos.get(node.slug)!,
      color: node.inProgress ? COLORS.alert : channelColor(node.channel),
    };
  });
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  pGeo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { size: { value: 3.2 * renderer.getPixelRatio() } },
    vertexShader: /* glsl */ `
      attribute vec3 color; attribute float alpha;
      varying vec3 vColor; varying float vAlpha; uniform float size;
      void main() {
        vColor = color; vAlpha = alpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (10.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        // square points: a pixel, not a glow blob
        gl_FragColor = vec4(vColor, vAlpha);
      }`,
  });
  const points = new THREE.Points(pGeo, pMat);
  world.add(points);

  const tmp = new THREE.Vector3();
  const tmpColor = new THREE.Color();

  function updateParticles(t: number) {
    // t: 0..1 across the sequence
    for (let i = 0; i < PARTICLES; i++) {
      const p = P[i];
      const local = clamp01((t - p.delay) / (1 - p.delay));
      const inward = clamp01(local / 0.7);
      const settle = clamp01((local - 0.7) / 0.3);
      const rStop = ringRadius(p.stop);
      const r = p.r0 + (rStop - p.r0) * easeInOut(inward);
      const y = p.y0 + (ringHeight(p.stop) - p.y0) * easeInOut(inward);
      tmp.set(Math.cos(p.theta) * r, y, Math.sin(p.theta) * r);

      if (p.detected && settle > 0) {
        tmp.lerp(p.target, easeInOut(settle));
        tmpColor.copy(COLORS.noise).lerp(p.color, settle);
        alpha[i] = 0.9 * (1 - settle * settle);
      } else {
        tmpColor.copy(COLORS.noise);
        alpha[i] = local === 0 ? 0 : 0.55 * (1 - settle);
      }
      pos.set([tmp.x, tmp.y, tmp.z], i * 3);
      col.set([tmpColor.r, tmpColor.g, tmpColor.b], i * 3);
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
    pGeo.attributes.alpha.needsUpdate = true;
  }

  // --- Idle packets along hub arcs --------------------------------------------
  const packetGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
  const packets: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; born: number }[] = [];
  let lastPacket = 0;
  function spawnPacket(now: number) {
    const h = hubCurves[Math.floor(Math.random() * hubCurves.length)];
    const from = nodes.find((n) => n.slug === h.a)!;
    const mesh = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: channelColor(from.channel) }));
    world.add(mesh);
    packets.push({ mesh, curve: h.curve, born: now });
  }

  // --- Labels ------------------------------------------------------------------
  const labelEls = [...labels.querySelectorAll<HTMLElement>('[data-slug]')];
  let highlight: string | null = null;
  labelEls.forEach((el) => {
    const on = () => (highlight = el.dataset.slug ?? null);
    const off = () => (highlight = null);
    el.addEventListener('pointerenter', on);
    el.addEventListener('pointerleave', off);
    el.addEventListener('focus', on);
    el.addEventListener('blur', off);
  });
  function placeLabels() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    for (const el of labelEls) {
      const p = nodePos.get(el.dataset.slug!);
      if (!p) continue;
      tmp.copy(p).applyMatrix4(world.matrixWorld).project(camera);
      // labels on the left half hang to the left of their node so they don't pile into the centre
      const left = tmp.x < -0.02;
      el.dataset.side = left ? 'left' : 'right';
      // keep every label fully inside the stage on narrow screens
      const lw = el.offsetWidth + 24;
      let x = ((tmp.x + 1) / 2) * w;
      x = left ? Math.max(lw, x) : Math.min(w - lw, x);
      el.style.transform = `translate(${x}px, ${((1 - tmp.y) / 2) * h}px)`;
    }
  }

  // --- Sizing, pointer, visibility --------------------------------------------
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // pull back on narrow screens so the outer ring stays in frame
    camera.zoom = Math.min(1, camera.aspect / 1.1);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => {
    resize();
    if (!running) render(performance.now());
  });
  ro.observe(canvas);

  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let visible = true;
  let running = false;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reducedMotion) start();
  });
  io.observe(canvas);

  // --- Frame -------------------------------------------------------------------
  let t0 = 0;
  function render(now: number) {
    const elapsed = reducedMotion ? SEQUENCE_MS : now - t0;
    const seq = clamp01(elapsed / SEQUENCE_MS);
    const settled = seq >= 1;

    updateParticles(seq);

    // arcs + labels arrive in the last 30% of the sequence
    const reveal = clamp01((seq - 0.7) / 0.3);
    labels.style.opacity = String(reveal);
    for (const hc of hubCurves) {
      const lit = highlight && (hc.a === highlight || hc.b === highlight);
      hc.mat.opacity = reveal * (lit ? 0.7 : highlight ? 0.06 : 0.18);
    }
    nodeMesh.forEach((m, slug) => {
      const s = highlight === slug ? 1.5 : 1;
      m.scale.lerp(tmp.set(s, s, s), 0.2);
    });

    if (!reducedMotion) {
      world.rotation.y = -0.18 + (1 - easeInOut(seq)) * 0.5 + pointer.x * 0.06;
      camera.position.set(camBase.x, camBase.y - pointer.y * 0.4, camBase.z);
      camera.lookAt(lookAt);

      if (settled && now - lastPacket > 1400) {
        spawnPacket(now);
        lastPacket = now;
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i];
        const u = (now - pk.born) / 1800;
        if (u >= 1) {
          world.remove(pk.mesh);
          (pk.mesh.material as THREE.Material).dispose();
          packets.splice(i, 1);
        } else pk.mesh.position.copy(pk.curve.getPoint(easeInOut(u)));
      }
    } else {
      world.rotation.y = -0.18;
    }

    world.updateMatrixWorld();
    renderer.render(scene, camera);
    placeLabels();
  }

  function loop(now: number) {
    if (!visible) {
      running = false;
      return;
    }
    render(now);
    requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  resize();
  t0 = performance.now();
  if (reducedMotion) render(t0);
  else start();
}
