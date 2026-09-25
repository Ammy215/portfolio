// Hero diorama: the seven projects as low-poly stations on a lit ground, arranged around a firewall.
// Outside the wall: what meets traffic first (decoy, network, URLs). Inside: analysis. Centre: correlation.
// One orchestrated intro: stations drop in, the firewall builds, a wave of packets arrives. Most bounce
// off the wall (noise); the few that pass a gate turn to signal and land on a station. Then it idles.
// Labels are real <a> elements positioned over the canvas, so they stay keyboard/screen-reader usable.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { nodes, hubs } from '../../data/graph';

// 'illustrated' = literal icons (honey pot, fish, logs...). 'engineered' = abstract hardware-like modules.
export type SceneVariant = 'illustrated' | 'engineered';

interface Options {
  canvas: HTMLCanvasElement;
  labels: HTMLElement; // container holding <a data-slug="..."> elements
  reducedMotion: boolean;
  variant?: SceneVariant;
}

// ---------- colour tokens (re-read when the page switches world colour) ----------
type Tok = 'white' | 'ink' | 'cyan' | 'mint' | 'amber' | 'amber-deep' | 'world' | 'world-deep' | 'accent';
const readTok = (t: Tok) => getComputedStyle(document.documentElement).getPropertyValue(`--${t}`).trim();
const painted: { m: THREE.Material & { color: THREE.Color }; tok: Tok }[] = [];
function paint<M extends THREE.Material & { color: THREE.Color }>(m: M, tok: Tok): M {
  painted.push({ m, tok });
  return m;
}
const solid = (tok: Tok) =>
  paint(new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0, flatShading: true }), tok);
const glow = (tok: Tok) => paint(new THREE.MeshBasicMaterial(), tok);
const M = {
  white: solid('white'),
  ink: solid('ink'),
  cyan: solid('cyan'),
  mint: solid('mint'),
  amber: solid('amber'),
  wood: solid('amber-deep'),
  accent: solid('accent'),
  screenMint: glow('mint'),
  screenCyan: glow('cyan'),
  screenAmber: glow('amber'),
};

// ---------- layout ----------
const deg = (d: number) => (d * Math.PI) / 180;
const R_OUT = 9;
const R_IN = 4.2;
const R_WALL = 6.6;
const CORE_EDGE = 1.95;

interface StationDef {
  angle: number; // degrees, 0 = +x, 90 = +z (towards the camera side)
  r: number;
  size: number;
  height: number;
  build: (g: THREE.Group) => void;
}

// camera looks from azimuth ~58°: far side of the scene is ~238°, screen-right ~328°, screen-left ~148°
const defs: Record<string, StationDef> = {
  'mini-siem': { angle: 0, r: 0, size: 3.3, height: 0.8, build: buildWorkstation },
  threathunter: { angle: 182, r: R_IN, size: 2.1, height: 0.5, build: buildMagnifier },
  fileshield: { angle: 290, r: R_IN, size: 2.1, height: 0.5, build: buildFiles },
  'intelligent-log-analyzer': { angle: 18, r: R_IN + 0.3, size: 2.1, height: 0.5, build: buildLogs },
  honeyshield: { angle: 208, r: R_OUT + 0.5, size: 2.2, height: 0.5, build: buildHoneypot },
  netsentinel: { angle: 262, r: R_OUT, size: 2.2, height: 0.5, build: buildRadar },
  'phishguard-ai': { angle: 328, r: R_OUT, size: 2.2, height: 0.5, build: buildPhish },
};
const gateAngles = nodes.filter((n) => n.zone === 'outside').map((n) => defs[n.slug].angle);

// Engineered variant: same stations, but each one is an abstract module that shows what it does,
// not a pun on its name.
const engineered: Record<string, (g: THREE.Group) => void> = {
  'mini-siem': buildRack,
  threathunter: buildScanner,
  fileshield: buildPlates,
  'intelligent-log-analyzer': buildStrata,
  honeyshield: buildDecoy,
  netsentinel: buildRadar,
  'phishguard-ai': buildFilter,
};

const polar = (angleDeg: number, r: number, y = 0) =>
  new THREE.Vector3(Math.cos(deg(angleDeg)) * r, y, Math.sin(deg(angleDeg)) * r);

// deterministic "random" so the scene is identical on every load
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// ---------- easing ----------
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOutBack = (t: number) => {
  const c1 = 1.5;
  return 1 + (c1 + 1) * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

// ---------- station builders (objects sit on y = 0 = pedestal top) ----------
function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function buildWorkstation(g: THREE.Group) {
  // three monitors, like the profile's pixel workstation: logs (mint), topology (cyan), dashboard (amber)
  g.add(mesh(new RoundedBoxGeometry(2.5, 0.14, 1.1, 2, 0.05), M.white, 0, 0.62, -0.1));
  g.add(mesh(new RoundedBoxGeometry(0.22, 0.62, 0.9, 2, 0.05), M.white, -1.05, 0.31, -0.1));
  g.add(mesh(new RoundedBoxGeometry(0.22, 0.62, 0.9, 2, 0.05), M.white, 1.05, 0.31, -0.1));
  const screens: [number, number, THREE.Material][] = [
    [-0.82, 0.5, M.screenCyan],
    [0, 0, M.screenMint],
    [0.82, -0.5, M.screenAmber],
  ];
  for (const [x, rot, face] of screens) {
    const mon = new THREE.Group();
    mon.add(mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 6), M.ink, 0, 0.15, 0));
    mon.add(mesh(new RoundedBoxGeometry(0.78, 0.52, 0.08, 2, 0.03), M.ink, 0, 0.55, 0));
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.4), face);
    f.position.set(0, 0.55, 0.045);
    mon.add(f);
    mon.position.set(x, 0.69, -0.25);
    mon.rotation.y = rot;
    g.add(mon);
  }
  g.add(mesh(new RoundedBoxGeometry(0.9, 0.05, 0.3, 2, 0.02), M.ink, 0, 0.71, 0.25)); // keyboard
}

function buildMagnifier(g: THREE.Group) {
  const glass = new THREE.Group();
  glass.add(mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 24), M.white));
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 24),
    paint(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.55, roughness: 0.2, side: THREE.DoubleSide }), 'cyan')
  );
  glass.add(lens);
  const handle = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.8, 6), M.ink, 0, -0.9, 0);
  glass.add(handle);
  glass.position.set(0, 1.35, 0);
  glass.rotation.z = deg(-28);
  glass.userData.bob = true;
  g.add(glass);
}

function buildLogs(g: THREE.Group) {
  const log = () => {
    const l = mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.25, 7), M.wood);
    l.rotation.z = Math.PI / 2;
    return l;
  };
  const a = log(); a.position.set(-0.1, 0.22, -0.25); g.add(a);
  const b = log(); b.position.set(-0.1, 0.22, 0.2); g.add(b);
  const c = log(); c.position.set(-0.1, 0.6, -0.02); g.add(c);
  // traffic cone: honest "work in progress" marker
  const cone = new THREE.Group();
  cone.add(mesh(new RoundedBoxGeometry(0.5, 0.06, 0.5, 2, 0.02), M.amber, 0, 0.03, 0));
  cone.add(mesh(new THREE.ConeGeometry(0.2, 0.62, 8), M.amber, 0, 0.36, 0));
  cone.add(mesh(new THREE.CylinderGeometry(0.105, 0.14, 0.12, 8), M.white, 0, 0.4, 0));
  cone.position.set(0.72, 0, 0.45);
  g.add(cone);
}

function buildFiles(g: THREE.Group) {
  const folder = (y: number, rot: number, mat: THREE.Material) => {
    const f = new THREE.Group();
    f.add(mesh(new RoundedBoxGeometry(1.2, 0.1, 0.85, 2, 0.03), mat));
    f.add(mesh(new RoundedBoxGeometry(0.4, 0.1, 0.2, 2, 0.03), mat, -0.35, 0, -0.45));
    f.position.y = y;
    f.rotation.y = rot;
    return f;
  };
  g.add(folder(0.06, 0.12, M.white));
  g.add(folder(0.18, -0.1, M.cyan));
  g.add(folder(0.3, 0.05, M.white));
  // a small shield standing on the stack
  const s = new THREE.Shape();
  s.moveTo(0, 0.5);
  s.lineTo(0.38, 0.38);
  s.lineTo(0.34, -0.05);
  s.quadraticCurveTo(0.25, -0.35, 0, -0.5);
  s.quadraticCurveTo(-0.25, -0.35, -0.34, -0.05);
  s.lineTo(-0.38, 0.38);
  s.closePath();
  const shield = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 }), M.mint);
  shield.position.set(0.15, 0.95, 0);
  g.add(shield);
}

function buildPhish(g: THREE.Group) {
  const fish = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.42, 7, 5), M.amber);
  body.scale.set(1.5, 0.85, 0.5);
  fish.add(body);
  const tail = mesh(new THREE.ConeGeometry(0.3, 0.45, 4), M.amber, -0.78, 0, 0);
  tail.rotation.z = Math.PI / 2;
  fish.add(tail);
  fish.add(mesh(new THREE.SphereGeometry(0.06, 6, 4), M.ink, 0.38, 0.1, 0.2));
  fish.position.set(0.1, 1.05, 0.3);
  fish.userData.bob = true;
  g.add(fish);
  // the guard: a shield disc the fish can't get past
  const guard = mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.14, 16), M.cyan, -0.35, 0.85, -0.45);
  guard.rotation.x = Math.PI / 2;
  guard.rotation.z = deg(12);
  g.add(guard);
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), M.ink, -0.35, 0.25, -0.45));
}

function buildRadar(g: THREE.Group) {
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.7, 6), M.ink, 0, 0.35, 0));
  const head = new THREE.Group();
  const dish = mesh(new THREE.SphereGeometry(0.72, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.6), paint(new THREE.MeshStandardMaterial({ roughness: 0.7, flatShading: true, side: THREE.DoubleSide }), 'white'));
  dish.rotation.x = deg(-120);
  head.add(dish);
  head.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 5), M.ink, 0, 0.12, 0.2));
  head.add(mesh(new THREE.SphereGeometry(0.08, 6, 4), M.accent, 0, 0.38, 0.33));
  head.position.y = 0.85;
  head.userData.spin = true;
  g.add(head);
  // three watched hosts
  for (const [x, z] of [[0.75, 0.55], [-0.7, 0.6], [0.6, -0.7]]) {
    g.add(mesh(new RoundedBoxGeometry(0.26, 0.26, 0.26, 2, 0.05), M.cyan, x, 0.13, z));
  }
}

function buildHoneypot(g: THREE.Group) {
  const profile = [
    [0.0, 0], [0.42, 0], [0.55, 0.12], [0.62, 0.38], [0.58, 0.64], [0.44, 0.8], [0.36, 0.86], [0.4, 0.92], [0.0, 0.92],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(profile, 9), M.amber));
  g.add(mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.1, 9), M.white, 0, 0.97, 0));
  g.add(mesh(new THREE.SphereGeometry(0.09, 6, 4), M.white, 0, 1.06, 0));
  const dipper = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 5), M.ink, 0.22, 1.15, 0.05);
  dipper.rotation.z = deg(-25);
  g.add(dipper);
  // two bees circling the decoy
  for (let i = 0; i < 2; i++) {
    const bee = new THREE.Group();
    const b = mesh(new THREE.SphereGeometry(0.1, 6, 4), M.ink);
    b.scale.set(1.4, 1, 1);
    bee.add(b);
    const wing = mesh(new THREE.SphereGeometry(0.08, 5, 3), M.white, 0, 0.1, 0);
    wing.scale.set(1, 0.3, 1.6);
    bee.add(wing);
    bee.userData.orbit = { radius: 0.95 + i * 0.25, speed: 1.4 - i * 0.5, phase: i * Math.PI, height: 1.25 + i * 0.25 };
    g.add(bee);
  }
}

// ---------- engineered builders ----------
const sharp = (w: number, h: number, d: number) => new RoundedBoxGeometry(w, h, d, 2, 0.025);

function buildRack(g: THREE.Group) {
  // correlation core: a cabinet with three indicator bars in the profile's monitor colours
  g.add(mesh(sharp(1.5, 1.55, 1.0), M.white, 0, 0.775, -0.1));
  const bars: [number, THREE.Material][] = [[1.18, M.screenCyan], [0.92, M.screenMint], [0.66, M.screenAmber]];
  for (const [y, mat] of bars) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.02), mat);
    bar.position.set(0, y, 0.41);
    g.add(bar);
  }
  for (let i = 0; i < 4; i++) g.add(mesh(new THREE.BoxGeometry(1.1, 0.025, 0.02), M.ink, 0, 0.26 + i * 0.07, 0.41));
  // two feeder units either side
  for (const x of [-1.15, 1.15]) {
    g.add(mesh(sharp(0.6, 0.62, 0.8), M.white, x, 0.31, 0));
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.02), M.screenMint);
    led.position.set(x, 0.45, 0.41);
    g.add(led);
  }
}

function buildScanner(g: THREE.Group) {
  // intel lookup: a scan ring sweeping over indicators under test
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8), M.ink, 0, 0.75, 0));
  const ring = mesh(new THREE.TorusGeometry(0.62, 0.035, 6, 40), M.cyan);
  ring.rotation.x = Math.PI / 2;
  ring.userData.scan = true;
  g.add(ring);
  const samples: [number, number, THREE.Material][] = [[0.35, 0.2, M.white], [-0.3, 0.3, M.cyan], [0.05, -0.38, M.white]];
  for (const [x, z, mat] of samples) g.add(mesh(sharp(0.22, 0.22, 0.22), mat, x, 0.11, z));
}

function buildPlates(g: THREE.Group) {
  // file analysis: a stack of file plates, one flagged, beside a column of hash blocks
  for (let i = 0; i < 5; i++) {
    const p = mesh(sharp(1.1, 0.06, 0.8), i === 4 ? M.mint : M.white, -0.2 + i * 0.02, 0.04 + i * 0.09, 0);
    p.rotation.y = (i % 2 ? 1 : -1) * 0.04;
    g.add(p);
  }
  for (let i = 0; i < 6; i++) g.add(mesh(sharp(0.16, 0.16, 0.16), i % 3 === 0 ? M.mint : M.white, 0.68, 0.09 + i * 0.18, 0.1));
}

function buildStrata(g: THREE.Group) {
  // log analysis: log lines as strata of different lengths; the top line is still being placed
  const lengths = [1.5, 1.1, 1.35, 0.8, 1.2];
  lengths.forEach((l, i) => g.add(mesh(sharp(l, 0.08, 0.55), M.white, -0.72 + l / 2, 0.05 + i * 0.12, 0)));
  const pending = mesh(sharp(0.9, 0.08, 0.55), M.amber, -0.72 + 0.45, 0.95, 0);
  pending.userData.bob = true;
  g.add(pending);
  // in-progress status strip along the front edge of the plinth
  g.add(mesh(new THREE.BoxGeometry(1.8, 0.05, 0.05), M.amber, 0, 0.025, 0.95));
}

function buildDecoy(g: THREE.Group) {
  // deception: an open frame with a lure at its centre
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 1.2, 1.2)),
    paint(new THREE.LineBasicMaterial(), 'ink')
  );
  frame.position.y = 0.62;
  g.add(frame);
  const lure = mesh(sharp(0.34, 0.34, 0.34), M.amber, 0, 0.62, 0);
  lure.userData.spin = true;
  g.add(lure);
  for (const [x, z] of [[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]]) {
    g.add(mesh(new THREE.BoxGeometry(0.06, 1.2, 0.06), M.white, x, 0.62, z));
  }
}

function buildFilter(g: THREE.Group) {
  // URL filtering: a slatted filter; one bad request stopped in front, clean ones through behind
  const w = 1.5;
  const h = 1.1;
  g.add(mesh(sharp(w, 0.08, 0.14), M.white, 0, 0.04, 0));
  g.add(mesh(sharp(w, 0.08, 0.14), M.white, 0, h, 0));
  g.add(mesh(sharp(0.08, h, 0.14), M.white, -w / 2, h / 2, 0));
  g.add(mesh(sharp(0.08, h, 0.14), M.white, w / 2, h / 2, 0));
  for (let i = 1; i <= 4; i++) g.add(mesh(new THREE.BoxGeometry(w - 0.1, 0.035, 0.05), M.cyan, 0, (h / 5) * i, 0));
  g.add(mesh(sharp(0.24, 0.24, 0.24), M.amber, 0.1, 0.5, 0.42));
  g.add(mesh(sharp(0.2, 0.2, 0.2), M.white, -0.35, 0.1, -0.5));
  g.add(mesh(sharp(0.2, 0.2, 0.2), M.white, 0.35, 0.1, -0.62));
}

// ---------- scene ----------
export function initHero({ canvas, labels, reducedMotion, variant = 'illustrated' }: Options) {
  const eng = variant === 'engineered';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 120);
  const camAzimuth = deg(58);
  const camDist = 21;
  const camHeight = 19.5;
  const lookAt = new THREE.Vector3(0, 0.4, 0);

  // Light: sky ambient tinted by the world colour, one warm-white sun casting soft shadows
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(-7, 16, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 5;
  scene.add(sun);

  // Ground: invisible except for the shadows it catches; the CSS gradient shows through
  const groundMat = paint(new THREE.ShadowMaterial({ opacity: 0.22 }), 'ink');
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const world = new THREE.Group();
  scene.add(world);

  // ---- stations ----
  interface Station {
    slug: string;
    group: THREE.Group;
    base: THREE.Vector3;
    anchor: THREE.Vector3; // where the label points
    delay: number;
    lift: number;
  }
  const order = ['honeyshield', 'netsentinel', 'phishguard-ai', 'threathunter', 'fileshield', 'intelligent-log-analyzer', 'mini-siem'];
  const stations: Station[] = order.map((slug, i) => {
    const d = defs[slug];
    const group = new THREE.Group();
    const pedestal = mesh(new RoundedBoxGeometry(d.size, d.height, d.size, 3, eng ? 0.04 : 0.14), M.white, 0, d.height / 2, 0);
    group.add(pedestal);
    const top = new THREE.Group();
    top.position.y = d.height;
    (eng ? engineered[slug] : d.build)(top);
    group.add(top);
    const base = polar(d.angle, d.r);
    group.position.copy(base);
    group.traverse((o) => (o.userData.slug = slug));
    world.add(group);
    return { slug, group, base, anchor: base.clone().setY(d.height + 1.9), delay: 0.08 + i * 0.1, lift: 0 };
  });
  const stationBySlug = new Map(stations.map((s) => [s.slug, s]));

  // ---- firewall ring (instanced bricks) ----
  // illustrated: two rows of chunky bricks. engineered: one row of thin, taller barrier panels.
  const WALL = eng
    ? { rows: 1, len: 0.96, gap: 0.05, h: 0.9, d: 0.14, r: 0.02 }
    : { rows: 2, len: 0.92, gap: 0.08, h: 0.4, d: 0.52, r: 0.06 };
  const BRICK_L = WALL.len;
  const perRow = Math.floor((2 * Math.PI * R_WALL) / (BRICK_L + WALL.gap));
  const gateHalf = (1.35 / R_WALL) * (180 / Math.PI);
  const bricks: { angle: number; row: number }[] = [];
  for (let row = 0; row < WALL.rows; row++) {
    for (let i = 0; i < perRow; i++) {
      const a = ((i + (row ? 0.5 : 0)) / perRow) * 360;
      const nearGate = gateAngles.some((g) => Math.abs(((a - g + 540) % 360) - 180) < gateHalf);
      if (!nearGate) bricks.push({ angle: a, row });
    }
  }
  const brickMesh = new THREE.InstancedMesh(new RoundedBoxGeometry(BRICK_L, WALL.h, WALL.d, 2, WALL.r), M.white, bricks.length);
  brickMesh.castShadow = true;
  brickMesh.receiveShadow = true;
  world.add(brickMesh);
  const dummy = new THREE.Object3D();
  function placeBricks(t: number) {
    bricks.forEach((b, i) => {
      // the wall builds as a sweep around the ring
      const local = clamp01((t - 0.55 - (b.angle / 360) * 0.7 - b.row * 0.12) / 0.35);
      const s = easeOutBack(local);
      dummy.position.copy(polar(b.angle, R_WALL, WALL.h / 2 + b.row * (WALL.h + 0.02) + (1 - local) * 1.2));
      dummy.rotation.set(0, -(deg(b.angle) + Math.PI / 2), 0);
      dummy.scale.setScalar(Math.max(0.0001, s));
      dummy.updateMatrix();
      brickMesh.setMatrixAt(i, dummy.matrix);
    });
    brickMesh.instanceMatrix.needsUpdate = true;
  }

  // ---- stepping-stone paths: outside stations through their gate to the core; inside stations to the core ----
  const routes = new Map<string, THREE.Vector3[]>();
  const tilePositions: THREE.Vector3[] = [];
  for (const n of nodes) {
    if (n.zone === 'core') continue;
    const d = defs[n.slug];
    const start = d.r - d.size / 2 - 0.55;
    const pts: THREE.Vector3[] = [];
    for (let r = start; r > CORE_EDGE; r -= 0.78) {
      const p = polar(d.angle, r, 0.03);
      const blocked = stations.some((s) => s.slug !== n.slug && s.slug !== 'mini-siem' && s.base.distanceTo(p) < 1.55);
      if (!blocked) pts.push(p);
    }
    routes.set(n.slug, pts);
    tilePositions.push(...pts);
  }
  const tileMat = paint(new THREE.MeshStandardMaterial({ roughness: 0.9, transparent: true, opacity: 0.85 }), 'white');
  const tiles = new THREE.InstancedMesh(new RoundedBoxGeometry(0.46, 0.06, 0.46, 2, 0.02), tileMat, tilePositions.length);
  tiles.receiveShadow = true;
  tilePositions.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.rotation.set(0, rand() * 0.6, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    tiles.setMatrixAt(i, dummy.matrix);
  });
  world.add(tiles);

  // ---- decor: low-poly trees and rocks at the edges, kept off paths and stations ----
  const decor: THREE.Object3D[] = [];
  const freeSpot = (p: THREE.Vector3) =>
    stations.every((s) => s.base.distanceTo(p) > 2.4) &&
    tilePositions.every((t) => t.distanceTo(p) > 1) &&
    Math.abs(p.length() - R_WALL) > 1.2;
  // engineered: no trees or rocks, just a faint survey grid on the ground
  if (eng) {
    // sized to the diorama's footprint so it never runs behind the headline
    const grid = new THREE.GridHelper(23, 23);
    const gm = grid.material as THREE.LineBasicMaterial;
    gm.transparent = true;
    gm.opacity = 0.12;
    paint(gm, 'ink');
    grid.position.y = 0.005;
    world.add(grid);
    decor.push(grid);
  }
  // screen-left (world ~100-190°) stays clear: that's where the headline sits
  for (let i = 0; i < (eng ? 0 : 30); i++) {
    const a = 195 + rand() * 225;
    const r = 7.8 + rand() * 7;
    const p = polar(a, r);
    if (!freeSpot(p)) continue;
    if (rand() < 0.55) {
      const tree = new THREE.Group();
      const h = 1.1 + rand() * 0.9;
      tree.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 5), M.wood, 0, 0.25, 0));
      const crown = mesh(new THREE.CylinderGeometry(0.42, 0.5, h, 5), M.mint, 0, 0.5 + h / 2, 0);
      crown.rotation.y = rand() * Math.PI;
      tree.add(crown);
      tree.position.copy(p);
      tree.rotation.z = (rand() - 0.5) * 0.12;
      world.add(tree);
      decor.push(tree);
    } else {
      const rock = mesh(new THREE.DodecahedronGeometry(0.28 + rand() * 0.3, 0), M.white);
      rock.position.copy(p).setY(0.15);
      rock.rotation.set(rand(), rand(), rand());
      rock.scale.y = 0.6;
      world.add(rock);
      decor.push(rock);
    }
  }

  // ---- hub arcs (shared dependencies), shown for the highlighted station ----
  const arcs: { a: string; b: string; mat: THREE.LineBasicMaterial }[] = [];
  hubs.forEach((hub, hi) => {
    for (let i = 0; i < hub.projects.length - 1; i++) {
      const A = stationBySlug.get(hub.projects[i])!.anchor.clone().setY(1.6);
      const B = stationBySlug.get(hub.projects[i + 1])!.anchor.clone().setY(1.6);
      const mid = A.clone().add(B).multiplyScalar(0.5).setY(4 + hi * 0.8);
      const mat = paint(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }), 'ink');
      world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(A, mid, B).getPoints(40)), mat));
      arcs.push({ a: hub.projects[i], b: hub.projects[i + 1], mat });
    }
  });

  // ---- intro packet wave ----
  const WAVE = 90;
  const packetGeo = new RoundedBoxGeometry(0.2, 0.2, 0.2, 1, 0.04);
  const wave = new THREE.InstancedMesh(packetGeo, paint(new THREE.MeshStandardMaterial({ roughness: 0.6, flatShading: true }), 'white'), WAVE);
  wave.castShadow = true;
  world.add(wave);
  const waveColors = { blocked: new THREE.Color(), passed: new THREE.Color() };
  const innerTargets = stations.filter((s) => s.slug !== 'honeyshield' && s.slug !== 'netsentinel' && s.slug !== 'phishguard-ai');
  const packets = Array.from({ length: WAVE }, () => {
    const passes = rand() < 0.22;
    const gate = gateAngles[Math.floor(rand() * gateAngles.length)];
    let angle = passes ? gate + (rand() - 0.5) * 3 : rand() * 360;
    if (!passes && gateAngles.some((g) => Math.abs(((angle - g + 540) % 360) - 180) < gateHalf + 2)) angle += gateHalf * 2.5;
    return {
      angle,
      passes,
      delay: 1.25 + rand() * 1.1,
      r0: 15 + rand() * 4,
      target: innerTargets[Math.floor(rand() * innerTargets.length)],
    };
  });
  const tmp = new THREE.Vector3();
  function placeWave(t: number) {
    packets.forEach((p, i) => {
      const u = clamp01((t - p.delay) / 1.0); // approach
      const v = clamp01((t - p.delay - 1.0) / 0.7); // after the wall
      let scale = u > 0 ? 1 : 0;
      if (!p.passes) {
        const r = u < 1 ? p.r0 + (R_WALL + 0.45 - p.r0) * easeInOut(u) : R_WALL + 0.45 + easeOut(v) * 2.2;
        const y = 0.2 + Math.abs(Math.sin(u * Math.PI * 2.5)) * 0.35 + Math.sin(v * Math.PI) * 0.9;
        tmp.copy(polar(p.angle, r, y));
        scale *= 1 - v; // bounced noise fades out
      } else {
        if (u < 1) {
          tmp.copy(polar(p.angle, p.r0 + (R_WALL - p.r0) * easeInOut(u), 0.2 + Math.abs(Math.sin(u * Math.PI * 2.5)) * 0.35));
        } else {
          const from = polar(p.angle, R_WALL, 0.2);
          const to = p.target.anchor.clone().setY(1.4);
          tmp.lerpVectors(from, to, easeInOut(v));
          tmp.y += Math.sin(v * Math.PI) * 1.4;
          if (v >= 1) scale = 0; // absorbed by the station
        }
      }
      dummy.position.copy(tmp);
      dummy.rotation.set(t * 3 + i, t * 2, 0);
      dummy.scale.setScalar(Math.max(0.0001, scale));
      dummy.updateMatrix();
      wave.setMatrixAt(i, dummy.matrix);
      wave.setColorAt(i, p.passes && u >= 1 ? waveColors.passed : waveColors.blocked);
    });
    wave.instanceMatrix.needsUpdate = true;
    if (wave.instanceColor) wave.instanceColor.needsUpdate = true;
  }

  // ---- idle packets hopping along real routes into the core ----
  const hopMat = solid('accent');
  const hops: { mesh: THREE.Mesh; route: THREE.Vector3[]; born: number }[] = [];
  const routeList = [...routes.entries()].filter(([, r]) => r.length > 2);
  let lastHop = 0;
  const HOP_MS = 190;
  function spawnHop(now: number) {
    const [, route] = routeList[Math.floor(Math.random() * routeList.length)];
    const m = mesh(packetGeo, hopMat);
    world.add(m);
    hops.push({ mesh: m, route: [...route, stationBySlug.get('mini-siem')!.anchor.clone().setY(1.2)], born: now });
  }
  let corePulse = 0;

  // ---- colours ----
  function applyColors() {
    for (const { m, tok } of painted) m.color.set(readTok(tok));
    hemi.color.set(0xffffff);
    hemi.groundColor.set(readTok('world'));
    waveColors.blocked.set(readTok('white'));
    waveColors.passed.set(readTok('accent'));
    if (!running && t0) render(performance.now());
  }
  document.addEventListener('worldchange', applyColors);

  // ---- labels ----
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
      const s = stationBySlug.get(el.dataset.slug!);
      if (!s) continue;
      tmp.copy(s.anchor).add(s.group.position).sub(s.base).project(camera);
      const lw = el.offsetWidth / 2 + 12;
      const x = Math.min(w - lw, Math.max(lw, ((tmp.x + 1) / 2) * w));
      el.style.transform = `translate(${x}px, ${((1 - tmp.y) / 2) * h}px)`;
      el.classList.toggle('is-active', highlight === s.slug);
    }
  }

  // ---- pointer: parallax + hover/click on stations ----
  const pointer = { x: 0, y: 0 };
  const ndc = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hovered: string | null = null;
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(stations.map((s) => s.group), true)[0];
    hovered = (hit?.object.userData.slug as string | undefined) ?? null;
    canvas.style.cursor = hovered ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => (hovered = null));
  canvas.addEventListener('click', () => {
    // defer to the matching signpost link, so the destination lives in one place (the markup)
    if (hovered) labelEls.find((el) => el.dataset.slug === hovered)?.click();
  });

  // ---- sizing: on wide screens the scene sits right of the headline ----
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const aspect = w / h;
    const wide = aspect > 1.15;
    // wide: the diorama sits in the right ~60%, centred a little above middle
    camera.zoom = wide ? Math.min(0.85, aspect / 2.55) : Math.max(0.46, aspect / 1.45);
    if (wide) camera.setViewOffset(w, h, -w * 0.155, -h * 0.035, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.12, w, h);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => {
    resize();
    if (!running && t0) render(performance.now());
  });
  ro.observe(canvas);

  let visible = true;
  let running = false;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reducedMotion) start();
  });
  io.observe(canvas);

  // ---- frame ----
  const INTRO = 3.4; // seconds
  let t0 = 0;
  function render(now: number) {
    const t = reducedMotion ? INTRO + 1 : (now - t0) / 1000;
    const settled = t >= INTRO;
    const active = highlight ?? hovered;

    // stations drop in, outside first
    for (const s of stations) {
      const u = clamp01((t - s.delay) / 0.55);
      const target = active === s.slug ? 0.35 : 0;
      s.lift += (target - s.lift) * 0.15;
      s.group.position.set(s.base.x, (1 - easeOutBack(u)) * 4 + s.lift, s.base.z);
      s.group.scale.setScalar(Math.max(0.0001, easeOut(u)));
      if (s.slug === 'mini-siem' && corePulse > 0) s.group.scale.multiplyScalar(1 + corePulse * 0.04);
    }
    corePulse = Math.max(0, corePulse - 0.06);

    placeBricks(t);
    tiles.visible = t > 0.9;
    decor.forEach((d, i) => d.scale.setScalar(Math.max(0.0001, easeOutBack(clamp01((t - 0.9 - i * 0.03) / 0.4)))));
    wave.visible = t < 4.3;
    if (wave.visible) placeWave(t);

    labels.style.opacity = String(clamp01((t - 2.6) / 0.6));
    for (const arc of arcs) {
      const lit = active && (arc.a === active || arc.b === active);
      arc.mat.opacity += ((lit ? 0.55 : 0) - arc.mat.opacity) * 0.15;
    }

    // idle life
    const secs = now / 1000;
    world.traverse((o) => {
      if (o.userData.spin) o.rotation.y = secs * 0.8;
      if (o.userData.scan) o.position.y = 0.3 + (Math.sin(secs * 1.3) + 1) * 0.55;
      if (o.userData.bob) o.position.y += Math.sin(secs * 2 + o.id) * 0.0015;
      const orb = o.userData.orbit as { radius: number; speed: number; phase: number; height: number } | undefined;
      if (orb) {
        const a = secs * orb.speed + orb.phase;
        o.position.set(Math.cos(a) * orb.radius, orb.height + Math.sin(a * 2) * 0.1, Math.sin(a) * orb.radius);
        o.rotation.y = -a;
      }
    });

    if (!reducedMotion) {
      if (settled && now - lastHop > 1300) {
        spawnHop(now);
        lastHop = now;
      }
      for (let i = hops.length - 1; i >= 0; i--) {
        const hp = hops[i];
        const f = (now - hp.born) / HOP_MS;
        const k = Math.floor(f);
        if (k >= hp.route.length - 1) {
          world.remove(hp.mesh);
          hops.splice(i, 1);
          corePulse = 1;
          continue;
        }
        const u = f - k;
        hp.mesh.position.lerpVectors(hp.route[k], hp.route[k + 1], u);
        hp.mesh.position.y += 0.15 + Math.sin(u * Math.PI) * 0.35;
      }

      const az = camAzimuth + pointer.x * 0.06;
      camera.position.set(Math.cos(az) * camDist, camHeight - pointer.y * 0.8, Math.sin(az) * camDist);
    } else {
      camera.position.set(Math.cos(camAzimuth) * camDist, camHeight, Math.sin(camAzimuth) * camDist);
    }
    camera.lookAt(lookAt);

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

  applyColors();
  resize();
  t0 = performance.now();
  if (reducedMotion) render(t0);
  else start();
}
