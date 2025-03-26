import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize renderer first
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight - 100);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(scene.position);

// Now create controls after renderer is defined
const controls = new OrbitControls(camera, renderer.domElement);

// Add Axes Helper
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// Create a Grid Helper Function
function createGrid(width, height, rotation, color) {
  const gridHelper = new THREE.GridHelper(width, height, color, color);
  if (rotation === 'xy') {
    gridHelper.rotation.x = Math.PI / 2; // Align with XY-plane
  } else if (rotation === 'yz') {
    gridHelper.rotation.z = Math.PI / 2; // Align with YZ-plane
  }
  return gridHelper;
}

// XY-Plane Grid
const xyGrid = createGrid(100, 100, 'xy', 0x808080);
scene.add(xyGrid);

// XZ-Plane Grid
const xzGrid = createGrid(100, 100, 'xz', 0x808080);
scene.add(xzGrid);

// YZ-Plane Grid
const yzGrid = createGrid(100, 100, 'yz', 0x808080);
scene.add(yzGrid);

// Add labeled axes
function addLabeledAxes() {
  // Create axis lines with custom colors and thickness
  const xAxisGeometry = new THREE.BufferGeometry();
  xAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 21, 0, 0], 3));
  const xAxis = new THREE.Line(xAxisGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 }));
  scene.add(xAxis);

  const yAxisGeometry = new THREE.BufferGeometry();
  yAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 21, 0], 3));
  const yAxis = new THREE.Line(yAxisGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 }));
  scene.add(yAxis);

  const zAxisGeometry = new THREE.BufferGeometry();
  zAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 21], 3));
  const zAxis = new THREE.Line(zAxisGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 }));
  scene.add(zAxis);

  // Add labels using your makeTextSprite function
  const xLabel = makeTextSprite("X", { fontsize: 24, backgroundColor: { r: 255, g: 255, b: 255, a: 0.7 } });
  xLabel.position.set(0, 0, 24);
  scene.add(xLabel);

  const yLabel = makeTextSprite("Y", { fontsize: 24, backgroundColor: { r: 255, g: 255, b: 255, a: 0.7 } });
  yLabel.position.set(24, 0, 0);
  scene.add(yLabel);

  const zLabel = makeTextSprite("Z", { fontsize: 24, backgroundColor: { r: 255, g: 255, b: 255, a: 0.7 } });
  zLabel.position.set(0, 24, 0);
  scene.add(zLabel);

  // Add increment markers and labels
  for (let i = 5; i <= 50; i += 5) {
    // X-axis markers
    const xMarkerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const xMarker = new THREE.Mesh(xMarkerGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    xMarker.position.set(i, 0, 0);
    scene.add(xMarker);

    const xMarkLabel = makeTextSprite(i.toString(), { fontsize: 10, backgroundColor: { r: 255, g: 255, b: 255, a: 0 } });
    xMarkLabel.position.set(i, -0.5, 0);
    scene.add(xMarkLabel);

    // Y-axis markers
    const yMarkerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const yMarker = new THREE.Mesh(yMarkerGeometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    yMarker.position.set(0, i, 0);
    scene.add(yMarker);

    const yMarkLabel = makeTextSprite(i.toString(), { fontsize: 10, backgroundColor: { r: 255, g: 255, b: 255, a: 0.5 } });
    yMarkLabel.position.set(-0.5, i, 0);
    scene.add(yMarkLabel);

    // Z-axis markers
    const zMarkerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const zMarker = new THREE.Mesh(zMarkerGeometry, new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    zMarker.position.set(0, 0, i);
    scene.add(zMarker);

    const zMarkLabel = makeTextSprite(i.toString(), { fontsize: 10, backgroundColor: { r: 255, g: 255, b: 255, a: 0.5 } });
    zMarkLabel.position.set(0, -0.5, i);
    scene.add(zMarkLabel);
  }
}

// Call the function to add labeled axes
addLabeledAxes();

// Constants for the particle
const charge = 1; // Charge of the particle (Coulombs)
const mass = 1; // Mass of the particle (Kilograms)
// State vector: [x, y, z, vx, vy, vz]
let state = new Float32Array([0, 0, 0, 2, 0, 0.5]); // Initial position and velocity

// Time step
const deltaTime = 0.01; // Simulation time step (seconds)

var efieldx = 0;
var efieldy = 0;
var efieldz = 0; 
var bfieldx = 0;
var bfieldy = 0;
var bfieldz = 0;
// Function to calculate the next state
function calculateNextState(currentState) {
  const [x, y, z, vx, vy, vz] = currentState;

  // Validate the current state
  if ([x, y, z, vx, vy, vz].some(value => isNaN(value))) {
    console.error("Invalid state detected:", currentState);
    return currentState; // Return the current state without updating
  }

  // Calculate velocity derivatives
  const ax = (charge / mass) * (efieldx + vy * bfieldz - vz * bfieldy);
  const ay = (charge / mass) * (efieldy + vz * bfieldx - vx * bfieldz);
  const az = (charge / mass) * (efieldz + vx * bfieldy - vy * bfieldx);

  // Update position and velocity
  return new Float32Array([
    x + vx * deltaTime,
    y + vy * deltaTime,
    z + vz * deltaTime,
    vx + ax * deltaTime,
    vy + ay * deltaTime,
    vz + az * deltaTime
  ]);
}

// Particle trajectory
const trajectoryGeometry = new THREE.BufferGeometry();
const trajectoryPositions = [];
const maxSteps = 40; // Limit the number of simulation steps

// Add particle to scene
const particleGeometry = new THREE.SphereGeometry(0.3); // this is the particle
const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const particle = new THREE.Mesh(particleGeometry, particleMaterial);
scene.add(particle);
console.log('Particle added to scene:', particle.position);

let simulationPaused = false;
const delay = 1000;

// Animation loop for simulation
function simulate() {
  if (simulationPaused) return;

  if (trajectoryPositions.length / 3 < maxSteps) {
    state = calculateNextState(state);
    console.log('Calculated next state:', state);
    // Update particle position
    particle.position.set(state[0], state[1], state[2]);
    console.log('Updated particle position:', particle.position);

    // Record trajectory
    trajectoryPositions.push(state[0], state[1], state[2]);
    trajectoryGeometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(trajectoryPositions, 3));
  
    renderer.render(scene, camera);

    setTimeout(simulate, delay);

  }
}

export function startSimulation(){
  simulationPaused = false;
  console.log("Simulation started...");
  simulate();
}

export function pauseSimulation(){
  simulationPaused = true;
  console.log("Simulation paused...");
}

export function passInEMValues(electromagneticField){
  [efieldx, efieldy, efieldz, bfieldx, bfieldy, bfieldz] = electromagneticField;
  console.log("received", efieldx, efieldy, efieldz, bfieldx, bfieldy, bfieldz);
  animate();
}

// Animation Loop
export function animate() {
  console.log("Animate function running...");
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

}

function makeTextSprite(message, parameters) {
  if (parameters === undefined) parameters = {};

  var fontface = parameters.hasOwnProperty("fontface") ?
    parameters["fontface"] : "Arial";

  var fontsize = parameters.hasOwnProperty("fontsize") ?
    parameters["fontsize"] : 18;

  // Create a canvas with higher resolution for sharper text
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  // Set a higher resolution
  const pixelRatio = window.devicePixelRatio || 2;
  context.font = "Bold " + fontsize + "px " + fontface;

  // Measure text and add padding
  var metrics = context.measureText(message);
  var textWidth = metrics.width;

  // Make sure single digits have a minimum width
  const minWidth = fontsize * 0.8;
  const actualWidth = Math.max(textWidth, minWidth);

  // Set canvas dimensions with padding and apply device pixel ratio
  const padding = fontsize * 0.5;
  canvas.width = (actualWidth + padding * 2) * pixelRatio;
  canvas.height = (fontsize * 1.5) * pixelRatio;

  // Scale the context to account for the pixel ratio
  context.scale(pixelRatio, pixelRatio);

  // Reset the font after resizing the canvas
  context.font = "Bold " + fontsize + "px " + fontface;

  // Text color
  context.fillStyle = "rgba(255, 255, 255, 1.0)";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Position text in the center of the canvas
  context.fillText(message, actualWidth / 2 + padding, fontsize * 0.75);

  // Canvas contents will be used for a texture
  var texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  var sprite = new THREE.Sprite(spriteMaterial);

  // Scale the sprite proportionally
  const aspectRatio = canvas.width / canvas.height;
  const scale = fontsize * 0.1; // Adjust this value to control overall size
  sprite.scale.set(scale * aspectRatio, scale, 1.0);

  return sprite;
}