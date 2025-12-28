import * as THREE from "three";
import { MeasurementSystem } from "../MeasurementSystem";

console.log("Preview running");

// ================= SCENE =================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// ================= HELPERS =================
scene.add(new THREE.GridHelper(10, 10));
scene.add(new THREE.AxesHelper(5));

// ================= MEASUREMENT SYSTEM =================
const measurement = MeasurementSystem.createReference();
measurement.init({ scene, camera });
measurement.activate();

// ================= RAYCAST SETUP =================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// XZ ground plane at y = 0
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function getWorldPosition(event: MouseEvent): THREE.Vector3 {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const point = new THREE.Vector3();
  raycaster.ray.intersectPlane(groundPlane, point);

  return point;
}

// ================= EVENTS =================
window.addEventListener("mousemove", (e) => {
  const worldPosition = getWorldPosition(e);

  measurement.handleEvent("MOUSE", {
    type: "MOUSE_MOVE",
    worldPosition,
  });
});

window.addEventListener("click", (e) => {
  const worldPosition = getWorldPosition(e);

  measurement.handleEvent("MOUSE", {
    type: "MOUSE_CLICK",
    worldPosition,
    shiftKey: e.shiftKey,
  });
});

window.addEventListener("keydown", (e) => {
  measurement.handleEvent("KEY", {
    type: "KEY_DOWN",
    key: e.key,
  });
});

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ================= RENDER LOOP =================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
