export enum CameraType {
    Perspective = "PERSPECTIVE",
    Orthographic = "ORTHOGRAPHIC"
}

export interface CityCordinate {
    latitude: number;
    longitude: number;
}

export interface SunPosition {
    elevation: number;
    azimuth: number;
}