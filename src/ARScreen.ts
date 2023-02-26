type ResizeEvent = (width?: number, height?: number, aspectRatio?: number) => void;;

export class ARScreen {
    private static instance: ARScreen = null;
    private width: number;
    private height: number;
    private aspectRatio: number;
    private onResizeEvent: Array<ResizeEvent>;

    public static get Instance(): ARScreen {
        if (!ARScreen.instance) {
            ARScreen.instance = new ARScreen();
            ARScreen.Instance.init();
        }
        return ARScreen.instance;
    }

    public init() {
        this.onResizeEvent = new Array<ResizeEvent>();
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = (this.width / this.height);

        window.removeEventListener('resize', ARScreen.Instance.onResize);
        window.addEventListener('resize', ARScreen.Instance.onResize);
    }

    public subscribeToResize(callback: ResizeEvent) {
        this.onResizeEvent.push(callback);
    }

    public flush() {
        this.onResizeEvent.splice(0, this.onResizeEvent.length);
        window.removeEventListener('resize', ARScreen.Instance.onResize);
    }

    private onResize = () => {
        ARScreen.Instance.update();
    }

    private update = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = (this.width / this.height);
        this.onResizeEvent.forEach((event) => {
            event(this.width, this.height, this.aspectRatio);
        });
    }

    public get WIDTH() {
        return this.width;
    }

    public get HEIGHT() {
        return this.height;
    }

    public get ASPECT_RATIO() {
        return this.aspectRatio;
    }
}