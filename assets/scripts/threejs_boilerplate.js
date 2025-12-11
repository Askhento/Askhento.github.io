import * as THREE from "./three.js";

import { OrbitControls } from "./OrbitControls.js";

// import Stats from "/assets/scripts/stats.module.js";
import { GUI } from "./lil-gui.module.min.js";

// import { GPUComputationRenderer } from "/assets/scripts/GPUComputationRenderer.js";

export var scene, renderer, camera, controls, canvas, labels, gui, threejsContainer, threejsWrapper;

// init();

// export function init() {
const postContent = document.getElementsByClassName("post-content e-content")[0];
postContent.style.width = "50%";

const postHeaderElem = postContent.parentElement;
postHeaderElem.style.display = "flex";
// postHeaderElem.style.position = "relative";

threejsContainer = document.createElement("div");
threejsContainer.id = "threejs_container";

threejsWrapper = document.createElement("div");
threejsWrapper.id = "threejs_wrapper";

// canvas = document.getElementById("threejs_canvas");
if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "threejs_canvas";
}

if (!labels) {
    labels = document.createElement("div");
    labels.id = "threejs_labels";
}

postHeaderElem.appendChild(threejsContainer);
threejsContainer.appendChild(threejsWrapper);
threejsWrapper.appendChild(canvas);
canvas.appendChild(labels);

canvas.height = canvas.width;

// gui = new GUI({ autoPlace: false });
// gui.domElement.id = "gui";
// threejsDiv.appendChild(gui.domElement);

renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

//this is to get the correct pixel detail on portable devices
renderer.setPixelRatio(window.devicePixelRatio);

//and this sets the canvas' size.
// renderer.setSize(window.innerWidth, window.innerHeight);

scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0x0, 0.03);

scene.background = new THREE.Color(0.0, 0.0, 0.0);

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);

const gridHelper = new THREE.GridHelper(
    50,
    100,
    new THREE.Color(0.3, 0.3, 0.3),
    new THREE.Color(0.2, 0.2, 0.2)
);

scene.add(gridHelper);

camera = new THREE.PerspectiveCamera(
    35, //FOV
    1.0, //aspect
    1, //near clipping plane
    100 //far clipping plane
);
camera.position.set(5, 5, 5);

controls = new OrbitControls(camera, canvas);
controls.rotateSpeed = 1.0;
controls.dampingFactor = 0.05;
controls.enableDamping = true;
controls.maxDistance = 30;
controls.minDistance = 4;

// canvas.onmousemove = function (e) {
//     console.log(e)
//     //  canvas.onmousemove();
//     //  if (mouseOver()) {
//     //   canvas.style["pointer-events"] = "auto";
//     //  } else {
//     //   canvas.style["pointer-events"] = "none";
//     // }
// };

// controls.enableDamping = true
// controls.dampingFactor = .1

// }
