import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as PREFABS from './prefabs.js';

// constants
const canvas = document.getElementById('app');
const uiTel = document.getElementById('ui-tel');
//
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
    canvas: canvas,
});
const composer = new EffectComposer(renderer);

// configure threejs components
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const renderPass = new RenderPass(scene, cam);
composer.addPass(renderPass);

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

const ship = PREFABS.ship(0xb00029);
ship.position.x = 80;
scene.add(ship);

const otherShip = PREFABS.ship(0x0000aa);
otherShip.position.x = -80;
scene.add(otherShip);

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
    ship.rotation.z += dPitch;
    //shipContainer.rotation.y += dYaw;
    // roll & yaw are handled a few lines down

    // calc ship axis
    const tipPos = new THREE.Vector3();
    const tailPos = new THREE.Vector3();
    const topPos = new THREE.Vector3();
    ship.children[0].getWorldPosition(tipPos);
    ship.children[1].getWorldPosition(tailPos);
    ship.children[2].getWorldPosition(topPos);
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

    ship.rotateOnWorldAxis(shipYaw, dYaw); // yaw
    ship.rotateOnWorldAxis(shipAxis, dRoll); // roll
    tipPos.lerp(tailPos, 5); // calc camera pos

    var dVel = 0;
    if (keys.includes('ArrowUp')) dVel += 1;
    if (keys.includes('ArrowDown')) dVel -= 1;
    ship.position.addScaledVector(shipAxis, dVel);

    // update debug controls if they exist
    if (debug) {
        controls.update();
    } else {
        // move camera to campos
        cam.position.set(tipPos.x, tipPos.y, tipPos.z);
        //cam.position.addScaledVector(shipYaw, 0);
        cam.lookAt(ship.position);
        cam.up = shipYaw;
    }

    // keep background stars out of reach
    backstars.position.set(cam.position.x, cam.position.y, cam.position.z);

    composer.render();
    updateUI();
}

function updateUI() {
    var fps = Math.floor(1000.0 / deltaTime);
    uiTel.innerHTML = 'FPS: ' + fps;
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
