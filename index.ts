import { ARScene } from "./src/ARScene";
import { ARScreen } from "./src/ARScreen";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { BoxGeometry, CameraHelper, DirectionalLight, DirectionalLightHelper, DoubleSide, Group, InstancedMesh, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { calculateSunPosition } from "./src/Utils/SunPositionCalculator";
import { GUI } from 'dat.gui';

let canvasElement: HTMLCanvasElement;
let myScene:ARScene;

let fbxLoader: FBXLoader;
let ground: Object3D;
let sun: Object3D;
let datePicker: HTMLInputElement;

let pathRadius = 50;
const dateUI = {
    day: 1,
    month: 1,
    hours: 13,
    minutes: 0,
    hoursMinutes: 0,
    animate: false
}

const result = {
    elevation: 0,
    azimuth: 0
}
let folder2:GUI;
let sunLight: DirectionalLight;
let sunHelper: DirectionalLightHelper;
let sphere: Object3D;
let gui: GUI;
let folder1: GUI;

window.onload = () => {
    setupGUI();
    init();
    onUIChange();
    renderFrame();
}

const setupGUI = () => {
    datePicker = document.querySelector("#datePicker");

    const date = (new Date()).toISOString().slice(0, 16);
    (datePicker as HTMLInputElement).value = date;

    gui = new GUI();
    folder1 = gui.addFolder('Date');
    folder1.add(dateUI, 'day', 1, 31, 1).onChange(onUIChange);
    folder1.add(dateUI, 'month', 1, 12, 1).onChange(onUIChange);
    folder1.add(dateUI, 'hours', 0, 24, 1).onChange(() => {
        dateUI.hoursMinutes = dateUI.hours * dateUI.minutes;
        folder1.updateDisplay();
        onUIChange();
    });
    folder1.add(dateUI, 'minutes', 0, 60, 1).onChange(() => {
        dateUI.hoursMinutes = dateUI.hours * dateUI.minutes;
        folder1.updateDisplay();
        onUIChange();
    });
    folder1.add(dateUI, 'hoursMinutes', 0, 1440, 1).onChange(() => {
        hoursMinsUpdate();
    });
    folder1.add(dateUI, 'animate').onChange(() => { 
        onUIChange();
    });

    folder2 = gui.addFolder('Solar Angles');
    folder2.add(result, 'elevation', result.elevation);
    folder2.add(result, 'azimuth', result.azimuth);
}

const hoursMinsUpdate = () => {
    dateUI.hours = dateUI.hoursMinutes / 60;
    dateUI.minutes = dateUI.hoursMinutes % 60;
    folder1.updateDisplay();
    onUIChange();
}

const onUIChange = () => {
    const date = new Date(2023, dateUI.month, dateUI.day, dateUI.hours, dateUI.minutes);
    const sunPos = calculateSunPosition({
        latitude: 30.30970,
        longitude: 78.04890
    }, date);

    const elevationR = (sunPos.elevation) * MathUtils.DEG2RAD;
    const azimuthR = sunPos.azimuth * MathUtils.DEG2RAD;

    const z = pathRadius * Math.cos(elevationR) * Math.cos(azimuthR);
    const x = pathRadius * Math.cos(elevationR) * Math.sin(azimuthR);
    const y = pathRadius * Math.sin(elevationR);

    result.elevation = sunPos.elevation;
    result.azimuth = sunPos.azimuth;
    sun.position.set(x, y, z);
    sunLight.position.set(x, y, z);
    sunLight.lookAt(new Vector3());
    sunHelper = new DirectionalLightHelper(sunLight, 5);

    folder2.updateDisplay();
}

const init = () => {
    ARScreen.Instance.init();
    canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    canvasElement.width = ARScreen.Instance.WIDTH;
    canvasElement.height = ARScreen.Instance.HEIGHT;
    document.body.appendChild(canvasElement);

    myScene = new ARScene(canvasElement);
    ARScreen.Instance.subscribeToResize((width, height) => {
        canvasElement.width = width;
        canvasElement.height = height;
    });
    fbxLoader = new FBXLoader();
    fbxLoader.load("/assets/house3/Cottage_FREE1.fbx", (obj: Group) => {
        obj.position.set(0, 0.1, 0);
        obj.scale.set(0.1, 0.1, 0.1);
        obj.children.forEach(child => {
            if (child.constructor.name === "Mesh") {
                (child as Mesh).material = new MeshStandardMaterial();
                child.castShadow = true;
                child.receiveShadow = true;
                ((child as Mesh).material as MeshStandardMaterial).needsUpdate = true;
            }
        });
       myScene.ThreeScene.add(obj);
    });

    fbxLoader.load("/assets/house3/tree.fbx", (obj: Group) => {
        obj.position.set(15, 1, -8);
        obj.scale.set(0.006, 0.006, 0.006);
        obj.children.forEach(child => {
            if (child.constructor.name === "Mesh") {
                (child as Mesh).material = new MeshStandardMaterial();
                child.castShadow = true;
                child.receiveShadow = true;
                ((child as Mesh).material as MeshStandardMaterial).needsUpdate = true;
            }
        });
       myScene.ThreeScene.add(obj);
       
       const tree2 =  obj.clone(true);
       obj.position.set(-20, 1, -8);
       myScene.ThreeScene.add(tree2);

       const tree3 =  obj.clone(true);
       obj.position.set(-30, 1, -25);
       myScene.ThreeScene.add(tree3);
    });

    ground = new Mesh(new PlaneGeometry(), new MeshStandardMaterial({side: DoubleSide}));
    ground.scale.set(100, 100, 1);
    ground.castShadow = true;
    ground.receiveShadow = true;
    ground.rotateX(MathUtils.DEG2RAD * -90);
    myScene.ThreeScene.add(ground);

    sun = new Mesh(new SphereGeometry(), new MeshBasicMaterial());
    sun.scale.set(1, 1, 1);
    sun.castShadow = false;
    myScene.ThreeScene.add(sun);

    sunLight = new DirectionalLight();
    myScene.ThreeScene.add(sunLight);
    sunLight.castShadow = true;
   

    sunLight.shadow.mapSize.width = 999999; // default
    sunLight.shadow.mapSize.height = 999999; // default
    sunLight.shadow.camera.near = 0.5; // default
    sunLight.shadow.camera.far = 100;
    const frustrumD = 100;

    sunLight.shadow.camera.left = -frustrumD;
    sunLight.shadow.camera.right = frustrumD;
    sunLight.shadow.camera.top = -frustrumD;
    sunLight.shadow.camera.bottom = frustrumD;
    sunLight.shadow.bias = -0.005;
}

let animationCycle = 4000 + 1;

const renderFrame = () => {
    if (dateUI.animate) {
        dateUI.hoursMinutes = ((performance.now() % animationCycle) / animationCycle) * 1440;
        hoursMinsUpdate();
    }
    myScene.renderFrame();
    requestAnimationFrame(renderFrame);
}



