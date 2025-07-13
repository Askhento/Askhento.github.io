import {
    scene,
    renderer,
    camera,
    controls,
    canvas,
    gui,
    labels,
    threejsContainer,
    threejsWrapper,
} from "../threejs_boilerplate.js";
import * as THREE from "../three.js";
import { FontLoader } from "../FontLoader.js";
import { TextGeometry } from "../TextGeometry.js";

/*
    todo : add ortho camera tick box
    todo : fix text
    todo : switch wiev to cameraVisual



*/

function makeTextSprite(message, parameters) {
    if (parameters === undefined) parameters = {};
    let fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Courier New";
    let fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
    let borderThickness = parameters.hasOwnProperty("borderThickness")
        ? parameters["borderThickness"]
        : 4;
    let borderColor = parameters.hasOwnProperty("borderColor")
        ? parameters["borderColor"]
        : { r: 0, g: 0, b: 0, a: 1.0 };
    let backgroundColor = parameters.hasOwnProperty("backgroundColor")
        ? parameters["backgroundColor"]
        : { r: 0, g: 0, b: 255, a: 1.0 };
    let textColor = parameters.hasOwnProperty("textColor")
        ? parameters["textColor"]
        : { r: 0, g: 0, b: 0, a: 1.0 };

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    context.font = "Bold " + fontsize + "px " + fontface;
    let metrics = context.measureText(message);
    let textWidth = metrics.width;

    context.fillStyle =
        "rgba(" +
        backgroundColor.r +
        "," +
        backgroundColor.g +
        "," +
        backgroundColor.b +
        "," +
        backgroundColor.a +
        ")";
    context.strokeStyle =
        "rgba(" +
        borderColor.r +
        "," +
        borderColor.g +
        "," +
        borderColor.b +
        "," +
        borderColor.a +
        ")";
    context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
    context.fillText(message, borderThickness, fontsize + borderThickness);

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    let spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
    let sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;
}

function PrintMatrix4(mat, digits = 2) {
    // checking elements of matrix
    const perpsElems = mat.toArray().map((e) => e.toFixed(digits));
    perpsElems.splice(4, 0, "\n");
    perpsElems.splice(9, 0, "\n");
    perpsElems.splice(14, 0, "\n");
    console.log(perpsElems.join(" "));
}

export function sawToooth(progress) {
    // return R.sub(1, R.sub(1, R.mul(2, progress)).abs());
    return 1.0 - Math.abs(1.0 - 2.0 * progress);
}

THREE.Matrix4.lerp = function (mat0, mat1, t) {
    const arr0 = mat0.toArray();
    const arr1 = mat1.toArray();

    const res = arr0.map(function (e, i) {
        return e * (1 - t) + arr1[i] * t;
    });

    return new THREE.Matrix4().fromArray(res);
};

const valueAnimation = (function iife() {
    let min = 0,
        max = 1,
        delta,
        value = 0,
        initial,
        completeCallback,
        completed = false,
        running = false;
    // var value = 0;

    function get() {
        return value;
    }

    function getSmoothed() {
        let x = (value - min) / (max - min);
        x = Math.max(0.0, x);
        x = Math.min(1.0, x);

        // Evaluate polynomial
        return x * x * x * (x * (x * 6 - 15) + 10);
    }

    function start() {
        completed = false;
        running = true;
    }

    function stop() {
        running = false;
    }

    function reset() {
        value = initial;
    }

    function isRunning() {
        return running;
    }

    function reverse() {
        delta = -delta;
        // push back a little
        value += delta;
    }

    function update(_delta) {
        if (!running) return;
        if (value < max && value >= min) value += _delta ? _delta : delta;
        else if (!completed) {
            completed = true;
            running = false;
            completeCallback();
        }
    }

    function init(config = {}) {
        ({ min, max, delta, initial, completeCallback } = config);
        value = initial;
        return {
            update: update,
            get: get,
            start: start,
            stop: stop,
            reset: reset,
            reverse: reverse,
            isRunning: isRunning,
            getSmoothed: getSmoothed,
        };
    }
    return {
        init: init,
    };
})();

function GetMatrix4MathJax(mat, digits = 2) {
    // checking elements of matrix

    const matArray = mat
        .toArray()
        .map(
            (e, i) =>
                "\\color{" + (Math.floor(i / 4) < 3 ? "red" : "green") + "}" + e.toFixed(digits)
        );

    const res = arrayToMathjaxMatrix4(matArray);

    // console.log(res);

    return res;
}

function arrayToMathjaxMatrix4(array) {
    let res = "$$\\begin{bmatrix} ";

    for (let i = 0; i < array.length - 1; i++) {
        if ((i + 1) % 4 == 0) {
            array[i] += " \\\\";
        } else {
            array[i] += " &";
        }
    }
    res += array.join(" ");

    res += " \\end{bmatrix}$$";
    return res;
}

function typesetMathJax(code) {
    MathJax.startup.promise = MathJax.startup.promise
        .then(() => MathJax.typesetPromise(code()))
        .catch((err) => console.log("Typeset failed: " + err.message));
    return MathJax.startup.promise;
}

function UpdateMathjaxMatrix(matrix, elem) {
    typesetMathJax(() => {
        elem.innerHTML = GetMatrix4MathJax(matrix);
        return [elem];
    });
}

function UpdateMathjaxMatrixFromArray(array, elem) {
    typesetMathJax(() => {
        elem.innerHTML = arrayToMathjaxMatrix4(array);
        console.log(arrayToMathjaxMatrix4(array));
        return [elem];
    });
}

// function MathjaxStringToElem(string, elem) {
//     typesetMathJax(() => {
//         elem.innerHTML = string
//         return [elem];
//     });
// }

// THREE.Matrix4.lerp = function (mat0, mat1, t) {
//     let pos0 = new THREE.Vector3(),
//         pos1 = new THREE.Vector3(),
//         pos = new THREE.Vector3(),
//         scale0 = new THREE.Vector3(),
//         scale1 = new THREE.Vector3(),
//         scale = new THREE.Vector3(),
//         quat0 = new THREE.Quaternion(),
//         quat1 = new THREE.Quaternion(),
//         quat = new THREE.Quaternion();

//     mat0.decompose(pos0, quat0, scale0);
//     mat1.decompose(pos1, quat1, scale1);

//     pos.copy(pos0).lerp(pos1, t);
//     quat.copy(quat0).slerp(quat1, t);
//     scale.copy(scale0).lerp(scale1, t);

//     const res = new THREE.Matrix4();

//     // res.compose(
//     //     pos0.clone().lerp(pos1, t),
//     //     quat0.clone().slerp(quat1, t),
//     //     scale0.clone().lerp(scale1, t)
//     // )
//     res.compose(
//         pos,
//         quat,
//         scale
//     )
//     return res;
// }

let currentState = "LOCAL";
let nextState = "LOCAL";

// const stateButtons = ["initial_btn", "model_btn", "view_btn", "proj_btn"].reduce((acc, key) => ({ ...acc, [key]: document.getElementById(key) }), {})

const cubeUniforms = {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() },
    map: {
        type: "t",
        value: new THREE.TextureLoader().load("/assets/images/texture_analyzer_checkerboard.png"),
    },
};
const cubeMaterial = new THREE.ShaderMaterial({
    uniforms: cubeUniforms,

    vertexShader: document.getElementById("vertexShader-cube").textContent,

    fragmentShader: document.getElementById("fragmentShader-cube").textContent,

    side: THREE.DoubleSide,
});

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    cubeMaterial //createMaterial("/assets/images/texture_analyzer_checkerboard.png")
);

cube.matrixAutoUpdate = false;
cube.matrixWorldAutoUpdate = false;

cube.position.set(2.0, 0.0, 2);
cube.rotateY(Math.PI * 0.25);
scene.add(cube);

cube.updateMatrix();
cube.updateMatrixWorld();

const cameraVisual = new THREE.PerspectiveCamera(45, 1, 2.0, 4.0);
// const cameraVisual = new THREE.OrthographicCamera(-1, 1, 1, -1, 1.0, 3.0);
cameraVisual.matrixAutoUpdate = false;
cameraVisual.matrixWorldAutoUpdate = false;

cameraVisual.position.set(4, 0, 4);
cameraVisual.rotateY(Math.PI * 0.25);

cameraVisual.updateMatrix();
cameraVisual.updateMatrixWorld();
// cameraVisual.updateProjectionMatrix();

const cameraHelper = new THREE.CameraHelper(cameraVisual);
scene.add(cameraHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const perspMatrix = cameraVisual.matrix.clone();
const perspInverseMatrix = cameraVisual.matrix.clone().invert();
const perspProjInverseMatrix = cameraVisual.projectionMatrixInverse.clone();
let perspProjMatrix = cameraVisual.projectionMatrix.clone();

// fixing opengl's switching to right-handed coords
const perspProjArray = perspProjMatrix.toArray();
perspProjArray[10] = perspProjArray[10] * -1;
perspProjArray[14] = perspProjArray[14] * -1;

// perspProjArray[11] = perspProjArray[11] * -1;

perspProjMatrix.fromArray(perspProjArray);

const cubeMatrix = cube.matrix.clone();
const cubeViewMatrix = perspInverseMatrix.clone().multiply(cubeMatrix.clone());
const cubeProjMatrix = perspProjMatrix.clone().multiply(cubeViewMatrix.clone());
// const cubeProjMatrix = perspProjInverseMatrix.clone()

const cubeMatrices = {
    LOCAL: new THREE.Matrix4(),
    MODEL: cubeMatrix,
    VIEW: cubeViewMatrix,
    PROJ: cubeProjMatrix,
};

//

const cameraVisualMatrices = {
    LOCAL: new THREE.Matrix4(),
    MODEL: perspMatrix,
    VIEW: new THREE.Matrix4(),
    PROJ: perspProjMatrix,
};

const matrixSnapshot = {
    cube: cube.matrix.clone(),
    cameraVisual: cameraVisual.matrix.clone(),
};

// remove any transforms from them
cameraVisual.matrix = new THREE.Matrix4();
// cameraVisual.matrixWorld = new THREE.Matrix4();

cameraVisual.position.set(0, 0, 0);
cameraVisual.setRotationFromEuler(new THREE.Euler());
cameraVisual.scale.set(1, 1, 1);

cameraVisual.updateMatrix();
cameraVisual.updateMatrixWorld();

cube.matrix = new THREE.Matrix4();
// cube.matrixWorld = new THREE.Matrix4();

cube.position.set(0, 0, 0);
cube.setRotationFromEuler(new THREE.Euler());
cube.scale.set(1, 1, 1);

cube.updateMatrix();
cube.updateMatrixWorld(true);

const transformPreview = document.createElement("div");
transformPreview.id = "transform_preview";
threejsWrapper.appendChild(transformPreview);

UpdateMathjaxMatrix(cubeMatrix, transformPreview);

{
    const p = "\\color{purple}";
    const g = "\\color{green}";
    const r = "\\color{red}";

    UpdateMathjaxMatrixFromArray(
        `${p}1 ${r}0 ${r}0 0 ${r}0 ${p}1 ${r}0 0 ${r}0 ${r}0 ${p}1 0 ${g}0 ${g}0 ${g}0 1`.split(
            " "
        ),
        document.getElementById("identity_matrix_mathjax")
    );

    UpdateMathjaxMatrixFromArray(
        `${p}S_x*${r}R_{00} ${r}R_{01} ${r}R_{02} 0 ${r}R_{10} ${p}S_y*${r}R_{11} ${r}R_{12} 0 ${r}R_{20} ${r}R_{21} ${p}S_z*${r}R_{22} 0 ${g}Tx ${g}Ty ${g}Tz 1`.split(
            " "
        ),
        document.getElementById("example_matrix_mathjax")
    );
}

// cube.matrix = camera.matrix.clone().invert();

// PrintMatrix4(perspMatrix);

//// First attempt using canvas
// const stateLabel = makeTextSprite("Hello",
//     { fontsize: 12, textColor: { r: 255, g: 255, b: 255, a: 1.0 }, backgroundColor: { r: 255, g: 255, b: 255, a: 1.0 } });
// stateLabel.position.set(0, 0, 0);
// scene.add(stateLabel);

///// Second attemp using html elemetns
// const elem = document.createElement('div');
// elem.textContent = "test";
// canvas.appendChild(elem);

// // convert the normalized position to CSS coordinates
// const x = 0.5 * canvas.clientWidth;
// const y = 0.5 * canvas.clientHeight;

// // move the elem to that position
// elem.style.transform = `translate(${x}px,${y}px)`;
// // elem.style.width = "50%";
// // elem.style.height = "50%";

// Third Attmept 3d text!
// let textHint3d;
// const loader = new FontLoader();
// loader.load('/assets/fonts/Indie Flower_Regular.json', function (font) {

//     const geometry = new TextGeometry('three.js', {
//         font: font,
//         size: 1,
//         height: 1,
//         curveSegments: 10,
//         bevelEnabled: false,
//         bevelOffset: 0,
//         bevelSegments: 1,
//         bevelSize: 0.3,
//         bevelThickness: 1
//     });
//     const materials = [
//         new THREE.MeshPhongMaterial({ color: 0xff6600 }), // front
//         new THREE.MeshPhongMaterial({ color: 0x0000ff }) // side
//     ];
//     textHint3d = new THREE.Mesh(geometry, materials);
//     // textHint3d.castShadow = true
//     // textHint3d.position.y += 10
//     // textHint3d.position.x -= 6
//     // textHint3d.rotation.y = 0.25
//     scene.add(textHint3d)
// });

const stateCallbacks = {
    initial_btn: () => {
        currentState = "LOCAL";
        nextState = "LOCAL";
    },
    model_btn: () => {
        currentState = "LOCAL";
        nextState = "MODEL";
    },
    view_btn: () => {
        currentState = "MODEL";
        nextState = "VIEW";
    },
    proj_btn: () => {
        currentState = "VIEW";
        nextState = "PROJ";
    },
};

const buttonNames = ["initial_btn", "model_btn", "view_btn", "proj_btn"];
let lastButton = "initial_btn";

let stateAnimation = valueAnimation.init({
    min: 0.0,
    max: 1.0,
    initial: 0.0,
    delta: 0.005,
    completeCallback: (val) => {
        console.log("completed");
        // stateAnimation.reverse();
    },
});

for (const buttonName in stateCallbacks) {
    if (Object.hasOwnProperty.call(stateCallbacks, buttonName)) {
        const callback = stateCallbacks[buttonName];

        const elem = document.getElementById(buttonName);
        if (elem) {
            elem.onclick = () => {
                stateAnimation.reset();
                stateAnimation.start();

                matrixSnapshot.cube = cube.matrix.clone();
                matrixSnapshot.cameraVisual = cameraVisual.matrix.clone();

                callback();

                PrintMatrix4(cubeMatrices[nextState]);
                lastButton = buttonName;
            };
        }
    }
}

function updateMatrices() {
    let t = stateAnimation.getSmoothed();

    // cameraVisual.matrix = THREE.Matrix4.lerp(cameraVisualMatrices[currentState], cameraVisualMatrices[nextState], t)
    // cameraVisual.matrix = cameraVisualMatrices[nextState];
    cameraVisual.matrix = THREE.Matrix4.lerp(
        matrixSnapshot.cameraVisual,
        cameraVisualMatrices[nextState],
        t
    );
    cameraVisual.updateMatrixWorld(true);

    // const cubeCurrentMatrix = THREE.Matrix4.lerp(camera.matrixWorld.clone().multiply(cubeViewMatrix), cubeMatrices[nextState], t);
    // const cubeCurrentMatrix = THREE.Matrix4.lerp(cubeMatrices[currentState], cubeMatrices[nextState], t)
    const cubeCurrentMatrix = THREE.Matrix4.lerp(matrixSnapshot.cube, cubeMatrices[nextState], t);
    cube.matrix = cubeCurrentMatrix;
    cube.updateMatrixWorld(true);

    UpdateMathjaxMatrix(cubeCurrentMatrix, transformPreview);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000;
    cubeUniforms.time.value = elapsedSeconds;

    stateAnimation.update();
    // let t = sawToooth(stateAnimation.get());

    if (stateAnimation.isRunning()) {
        updateMatrices();
    }

    // cube.matrix = cubeCurrentMatrix.clone().multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, theta * 0.1, 0)));

    const cubeWorld = new THREE.Vector3();
    cube.getWorldPosition(cubeWorld);
    controls.target = cubeWorld;

    camera.updateMatrixWorld(true);

    renderer.render(scene, camera);
}

const startTime = Date.now();
animate();

let observerOptions = {
    rootMargin: "0px",
    threshold: 0.5,
};

function AttachScrollObserver() {
    var observer = new IntersectionObserver(observerCallback, observerOptions);

    function observerCallback(entries, observer) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                //do something
                let id = entry.target.id;
                if (!stateCallbacks[id]) id = "initial";
                currentState = id;
                stateCallbacks[currentState](currentState);
            }
        });
    }

    let target = "h3.state_transition";

    document.querySelectorAll(target).forEach((i) => {
        if (i) {
            observer.observe(i);
        }
    });
}

// AttachScrollObserver();
