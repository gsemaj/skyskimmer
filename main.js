import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as PREFABS from './prefabs.js';

// constants
const FOV = 75;
const FRUS_NEAR = 0.1;
const FRUS_FAR = 100000;

// vars
var lastRenderTime = Date.now();
var deltaTime = 0;
var debug = false;
var controls;

var keys = [];

// init threejs components
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(
    FOV,
    window.innerWidth / window.innerHeight,
    FRUS_NEAR,
    FRUS_FAR
);
const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector('#app'),
});

// configure threejs components
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

cam.position.y = 100;
cam.position.x = 100;
cam.position.z = 100;

// debug
if (debug) {
    scene.add(new THREE.GridHelper(1000, 100));
    controls = new OrbitControls(cam, renderer.domElement);
}

// scenery
scene.add(new THREE.AmbientLight(0x111111));

const backstars = PREFABS.background();
scene.add(backstars);

const sun1 = PREFABS.star(10, 0xffaaaa);
const sun2 = PREFABS.star(10, 0xaaffaa);
const sun3 = PREFABS.star(10, 0x99ddff);
sun1.position.set(-50, -50, -50);
sun2.position.set(-50, 50, -50);
sun3.position.set(-50, -50, 50);
scene.add(sun1, sun2, sun3);

const shipContainer = PREFABS.ship(0xb00029);
shipContainer.position.x = 80;
scene.add(shipContainer);

const base = PREFABS.starbase(undefined, 0xffffff);
scene.add(base);

// game loop
function paint() {
    // timing
    var timeNow = Date.now();
    deltaTime = timeNow - lastRenderTime;
    lastRenderTime = timeNow;
    requestAnimationFrame(paint);

    // game object movement
    // space station rotation
    base.rotation.x += 0.001;
    base.rotation.y += 0.001;
    base.rotation.z += 0.001;

    // ship controls
    var dRoll = 0;
    var dPitch = 0;
    var dYaw = 0;
    if (keys.includes('a')) dRoll -= 0.01;
    if (keys.includes('d')) dRoll += 0.01;
    if (keys.includes('w')) dPitch += 0.01;
    if (keys.includes('s')) dPitch -= 0.01;
    if (keys.includes('q')) dYaw += 0.01;
    if (keys.includes('e')) dYaw -= 0.01;
    shipContainer.rotation.z += dPitch;
    //shipContainer.rotation.y += dYaw;
    // roll & yaw are handled a few lines down

    // calc ship axis
    const tipPos = new THREE.Vector3();
    const tailPos = new THREE.Vector3();
    const topPos = new THREE.Vector3();
    shipContainer.children[2].getWorldPosition(tipPos);
    shipContainer.children[3].getWorldPosition(tailPos);
    shipContainer.children[4].getWorldPosition(topPos);
    const shipAxis = new THREE.Vector3(
        tipPos.x - tailPos.x,
        tipPos.y - tailPos.y,
        tipPos.z - tailPos.z
    ).normalize();
    const shipYaw = new THREE.Vector3(
        topPos.x - tailPos.x,
        topPos.y - tailPos.y,
        topPos.z - tailPos.z
    ).normalize();

    shipContainer.rotateOnWorldAxis(shipYaw, dYaw); // yaw
    shipContainer.rotateOnWorldAxis(shipAxis, dRoll); // roll
    tipPos.lerp(tailPos, 3.5); // calc camera pos

    var dVel = 0;
    if (keys.includes('ArrowUp')) dVel += 1;
    if (keys.includes('ArrowDown')) dVel -= 1;
    shipContainer.position.addScaledVector(shipAxis, dVel);

    // update debug controls if they exist
    if (debug) {
        controls.update();
    } else {
        // move camera to campos
        cam.position.set(tipPos.x, tipPos.y, tipPos.z);
        //cam.position.addScaledVector(shipYaw, 0);
        cam.lookAt(shipContainer.position);
        cam.up = shipYaw;
    }

    // keep background stars out of reach
    backstars.position.set(cam.position.x, cam.position.y, cam.position.z);

    renderer.render(scene, cam);
}

// input handling
document.onkeydown = (e) => {
    if (!keys.includes(e.key)) {
        keys.push(e.key);
    }
};
document.onkeyup = (e) => {
    if (keys.includes(e.key)) {
        keys.splice(keys.indexOf(e.key), 1);
    }
};

paint();
