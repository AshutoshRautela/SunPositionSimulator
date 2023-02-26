import { AmbientLight, AxesHelper, Camera, Color, DirectionalLight, LoadingManager, OrthographicCamera, PCFShadowMap, PerspectiveCamera, Scene, sRGBEncoding, Vector3, WebGLRenderer } from 'three';
import { CameraType } from './interfaces';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ARScreen } from './ARScreen';

export class ARScene {
    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: Camera;
    private loadingManager: LoadingManager;
    private light: AmbientLight;
    private controls: OrbitControls;
    private axesHelpher: AxesHelper;

    constructor(private canvas: HTMLCanvasElement, private cameraType: CameraType = CameraType.Perspective) {
        this.scene = new Scene();
        this.loadingManager = new LoadingManager();
        this.light = new AmbientLight(new Color(), 0.1);
        this.renderer = new WebGLRenderer({
            canvas
        });
        
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputEncoding = sRGBEncoding
        this.renderer.shadowMap.type = PCFShadowMap;
        this.light.castShadow = true;


        // this.scene.add(this.light);
        this.camera = this.cameraType === CameraType.Orthographic ? new OrthographicCamera() : new PerspectiveCamera();
        this.camera.position.set(0, 100, 100);
        (this.camera as PerspectiveCamera).far = 999999;
        (this.camera as PerspectiveCamera).aspect = ARScreen.Instance.ASPECT_RATIO;
        this.camera.lookAt(new Vector3());
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.axesHelpher = new AxesHelper(100);
        this.scene.add(this.axesHelpher);

        this.renderer.setViewport(0, 0, ARScreen.Instance.WIDTH, ARScreen.Instance.HEIGHT);
        ARScreen.Instance.subscribeToResize((width, height, aspectRatio) => {
            this.renderer.setViewport(0, 0, width, height);
            (this.camera as PerspectiveCamera).aspect = ARScreen.Instance.ASPECT_RATIO;
        });
    }

    renderFrame() {
        this.light.updateMatrix();
        (this.camera as PerspectiveCamera).updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }

    public get ThreeScene(): Scene {
        return this.scene;
    }

    public get ThreeLoadingManger():  LoadingManager {
        return this.loadingManager;
    }
}
