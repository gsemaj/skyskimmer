import './style.css';
import * as THREE from 'three';

// constants
const FOV = 75;
const FRUS_NEAR = 0.1;
const FRUS_FAR = 1000;

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
const geo = new THREE.IcosahedronGeometry(10);
const mat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: false,
});
const base = new THREE.Mesh(geo, mat);

const geoW = new THREE.EdgesGeometry(geo);
const matW = new THREE.LineBasicMaterial({
    color: 0x000000,
});
const wf = new THREE.LineSegments(geoW, matW);

scene.add(base);
base.add(wf);

// game loop
function paint() {
    requestAnimationFrame(paint);

    base.rotation.x += 0.01;
    base.rotation.y += 0.005;
    base.rotation.z += 0.01;

    renderer.render(scene, cam);
}

paint();
