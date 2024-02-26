import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons';
import roomURL from './room.glb?url';
import gsap from 'gsap';

/**
 * GUI
 */
const gui = new GUI();

/**
 * Debug object
 */
const debugObj = {
	backgroundColor: '#ddc88d',
	lightColor: '#ffffff',
};
document.body.style.backgroundColor = debugObj.backgroundColor;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = -0.652; // -6.552
camera.position.y = 0.82; // 1.807
camera.position.z = 1.1; // -5.077
scene.add(camera);

gui.add(camera.position, 'x').min(-20).max(20).step(0.001).name('camearaPositionx');
gui.add(camera.position, 'y').min(-20).max(20).step(0.001).name('camearaPositiony');
gui.add(camera.position, 'z').min(-20).max(20).step(0.001).name('camearaPositionz');

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Room
 */
gltfLoader.load(roomURL, gltf => {
	const model = gltf.scene;
	console.log(model);
	model.scale.set(0.1, 0.1, 0.1);
	scene.add(model);
	gsap.timeline()
		.to(camera.position, { y: 1.807, z: -5.077, duration: 1.5 })
		.to(camera.position, { x: -6.552, duration: 1.5 }, '-=.5');
});

/**
 * Lights
 */
const ambiLight = new THREE.AmbientLight(debugObj.lightColor, 3);
scene.add(ambiLight);

gui.add(ambiLight, 'intensity').min(0).max(10).step(0.01).name('lightIntensity');
gui.addColor(debugObj, 'lightColor').onChange(() => ambiLight.color.set(debugObj.lightColor));

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

gui.addColor(debugObj, 'backgroundColor').onChange(
	() => (document.body.style.backgroundColor = debugObj.backgroundColor)
);

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - lastElapsedTime;
	lastElapsedTime = elapsedTime;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
