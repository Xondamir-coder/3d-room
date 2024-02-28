import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader, OrbitControls, RGBELoader } from 'three/examples/jsm/Addons';
import roomModelURL from './assets/models/room.glb?url';
import morningHdrURL from './assets/hdr/morning.hdr?url';
import gsap from 'gsap';

/**
 * GUI
 */
const gui = new GUI();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();

/**
 * HDR
 */
rgbeLoader.load(morningHdrURL, hdr => {
	hdr.mapping = THREE.EquirectangularReflectionMapping;
	hdr.colorSpace = THREE.SRGBColorSpace;
	scene.background = hdr;
});

/**
 * Btns
 */
const dayBtns = document.querySelector('.day__buttons');
const dayProps = {
	morning: {
		sunY: 3.28,
		sunIntensity: 5,
		ambientIntensity: 3,
		envIntensity: 1,
	},
	afternoon: {
		sunY: 1.5,
		sunIntensity: 2.5,
		ambientIntensity: 2,
		envIntensity: 0.5,
	},
	night: {
		sunY: -1,
		sunIntensity: 0,
		ambientIntensity: 0.5,
		envIntensity: 0.1,
	},
};
dayBtns.addEventListener('click', e => {
	const btn = e.target.closest('.day__button');
	if (!btn) return;

	const i = btn.className.indexOf('-');
	const day = btn.className.slice(i + 1);
	const dayProperties = dayProps[day];

	const dayTl = gsap.timeline();
	dayTl
		.to(sunLight.position, { y: dayProperties.sunY, duration: 2 })
		.to(sunLight, { intensity: dayProperties.sunIntensity, duration: 2 }, 0)
		.to(ambientLight, { intensity: dayProperties.ambientIntensity, duration: 2 }, 0)
		.to(scene, { backgroundIntensity: dayProperties.envIntensity, duration: 2 }, 0);
});

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
scene.add(camera);

camera.position.x = -0.652;
camera.position.y = 0.82;
camera.position.z = 1.1;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Room
 */
gltfLoader.load(roomModelURL, gltf => {
	const model = gltf.scene;
	model.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});

	model.scale.set(0.1, 0.1, 0.1);
	scene.add(model);
	gsap.timeline()
		.to(camera.position, { y: 1.807, z: -5.077, duration: 1.5 })
		.to(camera.position, { x: -6.552, duration: 1.5 }, '-=.5');
});

/**
 * Roof
 */
const roof = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10, 10),
	new THREE.MeshStandardMaterial({ color: '#fff', side: THREE.DoubleSide })
);

roof.rotation.x = Math.PI / 2;
roof.position.y = 2.412;
roof.position.x = -2.31;
roof.position.z = -2.18;

scene.add(roof);

/**
 * Ambient
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

/**
 * Sun
 */
const sunLight = new THREE.DirectionalLight('#FDB813', 5);
scene.add(sunLight);

sunLight.position.x = 0.84;
sunLight.position.y = 3.28;
sunLight.position.z = 6.24;
sunLight.shadow.camera.near = 0.5; // default
sunLight.shadow.camera.far = 20; // default
sunLight.castShadow = true;

gui.add(sunLight.position, 'x').min(-20).max(20).name('sunLightPosX');
gui.add(sunLight.position, 'y').min(-20).max(20).name('sunLightPosY');
gui.add(sunLight.position, 'z').min(-20).max(20).name('sunLightPosZ');
gui.add(sunLight.target.position, 'x').min(-20).max(20).name('X');
gui.add(sunLight.target.position, 'y').min(-20).max(20).name('Y');
gui.add(sunLight.target.position, 'z').min(-20).max(20).name('Z');

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
