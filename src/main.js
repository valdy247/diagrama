import * as THREE from "three";

// Genuine 3D geometry: four vertical faces of one solid WebGL cuboid.
const words = ["POWER", "VISION", "DISCIPLINE", "AMBITION", "COURAGE", "PURPOSE", "MOMENTUM", "GROWTH"];
const faceSequence = [4, 0, 5, 1]; // +Z, +X, -Z, -X
const slice = document.querySelector(".cube-slice");
const mount = document.getElementById("cube-stage");
const fallback = document.getElementById("cube-fallback");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SIZE = 10, CAMERA_Z = 40, PERIOD_MS = 2000, TURN_MS = 1040;
let renderer, scene, camera, cuboid, edges;
let step = 0, animating = false, animationFrame = 0, interval = 0, lostContext = false;
const textures = new Map(), assigned = new Map();

function createFaceTexture(value, number, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = Math.round(Math.max(270, 2048 * height / width));
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Texture drawing unavailable");
  const w = canvas.width, h = canvas.height;
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, w, h);
  const inset = Math.max(44, w * 0.045);
  const smallSize = Math.max(17, Math.min(27, h * 0.065));
  c.fillStyle = "#767676";
  c.font = "700 " + smallSize + "px Arial, sans-serif";
  c.textAlign = "left";
  c.textBaseline = "top";
  c.fillText("01 / WHAT DRIVES US", inset, Math.max(20, h * 0.075));
  c.textAlign = "right";
  c.textBaseline = "bottom";
  c.fillText(
    String(number + 1).padStart(2, "0") + " — " + String(words.length).padStart(2, "0"),
    w - inset, h - Math.max(18, h * 0.07)
  );
  c.fillStyle = "#090909";
  c.textAlign = "center";
  c.textBaseline = "middle";
  // Narrow enough to be readable on both faces at the midpoint of rotation.
  let size = Math.min(h * 0.61, w * 0.22);
  const maxWidth = w * (width / height > 2.5 ? 0.51 : 0.62);
  while (size > 16) {
    c.font = "900 " + size + 'px "Arial Black", Arial, Helvetica, sans-serif';
    if (c.measureText(value).width <= maxWidth) break;
    size *= 0.96;
  }
  c.fillText(value, w / 2, h * 0.52);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

function updateFaceTextures(width, height, invalidate = false) {
  if (invalidate) {
    for (const texture of textures.values()) texture.dispose();
    textures.clear();
    assigned.clear();
  }
  for (let ahead = 0; ahead < 4; ahead++) {
    const slot = (step + ahead) % 4;
    const wordNumber = (step + ahead) % words.length;
    if (assigned.get(slot) === wordNumber) continue;
    let texture = textures.get(wordNumber);
    if (!texture) {
      texture = createFaceTexture(words[wordNumber], wordNumber, width, height);
      textures.set(wordNumber, texture);
    }
    const material = cuboid.material[faceSequence[slot]];
    material.map = texture;
    material.needsUpdate = true;
    assigned.set(slot, wordNumber);
  }
}

function resize() {
  if (!renderer || lostContext || !slice.isConnected) return;
  const width = Math.max(1, Math.round(slice.clientWidth));
  const height = Math.max(1, Math.round(slice.clientHeight));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(width, height, false);
  const worldHeight = SIZE * height / width;
  // Match the front face to the complete middle stripe while at rest.
  camera.aspect = width / height;
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(worldHeight / (2 * (CAMERA_Z - SIZE / 2))));
  camera.updateProjectionMatrix();
  cuboid.geometry.dispose();
  cuboid.geometry = new THREE.BoxGeometry(SIZE, worldHeight, SIZE);
  edges.geometry.dispose();
  edges.geometry = new THREE.EdgesGeometry(cuboid.geometry);
  updateFaceTextures(width, height, true);
  renderer.render(scene, camera);
}
function smooth(t) {
  const p = Math.max(0, Math.min(1, t));
  return p * p * (3 - 2 * p);
}
function angleAt(progress) {
  // Briefly hold the true shared corner in view (both faces remain visible).
  if (progress < 0.41) return 0.5 * smooth(progress / 0.41);
  if (progress < 0.56) return 0.5;
  return 0.5 + 0.5 * smooth((progress - 0.56) / 0.44);
}
function renderFrame(started) {
  if (!renderer || lostContext || reducedMotion.matches || document.hidden) {
    animating = false;
    return;
  }
  const t = Math.min(1, (performance.now() - started) / TURN_MS);
  cuboid.rotation.y = -(step % 4 + angleAt(t)) * Math.PI / 2;
  renderer.render(scene, camera);
  if (t < 1) {
    animationFrame = requestAnimationFrame(() => renderFrame(started));
  } else {
    step++;
    cuboid.rotation.y = -(step % 4) * Math.PI / 2;
    updateFaceTextures(Math.max(1, slice.clientWidth), Math.max(1, slice.clientHeight));
    renderer.render(scene, camera);
    animating = false;
  }
}
function turn() {
  if (!renderer || lostContext || reducedMotion.matches || animating || document.hidden) return;
  animating = true;
  const started = performance.now();
  animationFrame = requestAnimationFrame(() => renderFrame(started));
}
function setReducedMotion() {
  if (!renderer) return;
  if (reducedMotion.matches) {
    cancelAnimationFrame(animationFrame);
    animating = false;
    cuboid.rotation.y = -(step % 4) * Math.PI / 2;
    renderer.render(scene, camera);
  }
}
function start() {
  if (!slice || !mount) return;
  try {
    if (!document.createElement("canvas").getContext("webgl2")) return;
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: false, powerPreference: "high-performance"});
    renderer.setClearColor(0xffffff, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      lostContext = true;
      cancelAnimationFrame(animationFrame);
      slice.classList.remove("has-webgl");
      if (fallback) fallback.textContent = words[step % words.length];
    });
    renderer.domElement.addEventListener("webglcontextrestored", () => {
      lostContext = false;
      resize();
      slice.classList.add("has-webgl");
    });
    mount.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(25, 1, 0.1, 200);
    camera.position.set(0, 0, CAMERA_Z);
    camera.lookAt(0, 0, 0);
    // Physically oriented lights: the two adjacent faces receive different brightness.
    scene.add(new THREE.AmbientLight(0xffffff, 1.28));
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(-8, 9, 13);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.11);
    fill.position.set(13, 3, -5);
    scene.add(fill);

    const materials = Array.from({length: 6}, () => new THREE.MeshLambertMaterial({color: 0xffffff}));
    cuboid = new THREE.Mesh(new THREE.BoxGeometry(SIZE, 3, SIZE), materials);
    scene.add(cuboid);
    edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cuboid.geometry),
      new THREE.LineBasicMaterial({color: 0x222222, transparent: true, opacity: 0.25})
    );
    cuboid.add(edges);
    resize();
    slice.classList.add("has-webgl");

    new ResizeObserver(resize).observe(slice);
    reducedMotion.addEventListener("change", setReducedMotion);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && animating) {
        cancelAnimationFrame(animationFrame);
        animating = false;
        cuboid.rotation.y = -(step % 4) * Math.PI / 2;
        renderer.render(scene, camera);
      }
    });
    if (!reducedMotion.matches) interval = window.setInterval(turn, PERIOD_MS);
  } catch (error) {
    slice.classList.remove("has-webgl");
    console.error("VMV 3D hero could not initialize", error);
  }
}
start();
