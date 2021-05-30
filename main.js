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
var debug = true;
var controls;

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

cam.position.setZ(30);

// scenery
scene.add(new THREE.AmbientLight(0x111111));

const backstars = PREFABS.background();
scene.add(backstars);

//
//scene.add(PREFABS.star(1000, 0xffffff));
const sun1 = PREFABS.star(10, 0xffaaaa);
const sun2 = PREFABS.star(10, 0xaaffaa);
const sun3 = PREFABS.star(10, 0x99ddff);
sun1.position.set(-50, -50, -50);
sun2.position.set(-50, 50, -50);
sun3.position.set(-50, -50, 50);
scene.add(sun1, sun2, sun3);

const base = PREFABS.starbase(undefined, 0xffffff);
//base.position.set(-2000, -500, -2000);
scene.add(base);

// debug
if (debug) {
    //scene.add(new THREE.GridHelper(1000, 100));

    controls = new OrbitControls(cam, renderer.domElement);

    //const lightHelper = new THREE.PointLightHelper(light);
    //scene.add(lightHelper);
}

// game loop
function paint() {
    // timing
    var timeNow = Date.now();
    deltaTime = timeNow - lastRenderTime;
    lastRenderTime = timeNow;
    requestAnimationFrame(paint);

    base.rotation.x += 0.001;
    base.rotation.y += 0.001;
    base.rotation.z += 0.001;

    // keep background stars out of reach
    backstars.position.set(cam.position.x, cam.position.y, cam.position.z - 30);

    // update debug controls if they exist
    if (controls) {
        controls.update();
    }

    renderer.render(scene, cam);
}

paint();
