import { MathUtils } from "three";
import { CityCordinate, SunPosition } from "../interfaces";

const DECLINATION_CONSTANT = 23.45;
const DECLINATION_CONSTANT2 = 0.9863;

export const getDaysIntoYear = (date: Date) => {
    const diffInMilliseconds = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()) - Date.UTC(date.getFullYear(), 0, 0);
    return (diffInMilliseconds / 24 / 60 / 60 / 1000);
}

export const calculateDeclinationAngle = (day: number) => {
    return DECLINATION_CONSTANT * Math.sin(DECLINATION_CONSTANT2 * (day - 81) * MathUtils.DEG2RAD);
}

export const calculateDeclinationAngle2 = (day: number) => {
    return -DECLINATION_CONSTANT * Math.cos(DECLINATION_CONSTANT2 * (day + 10) * MathUtils.DEG2RAD);
}

export const getTimeInHours = (date: Date) => {
    return (date.getHours()) + (date.getMinutes() / 60) + (date.getSeconds() / 3600);
}

export const getHourAngle = (date: Date, days: number, cordinate: CityCordinate) => {
    const diff = (date.getTimezoneOffset() / 60);
    //const diff = ((date.getMinutes() - new Date(date.toISOString()).getMinutes()) / 60);
    const lstm =  15 * Math.abs(diff);
    const b = (DECLINATION_CONSTANT2 * (days - 81)) * MathUtils.DEG2RAD;
    const eot =  (9.87 * Math.sin(2 * b)) - (7.53 * Math.cos(b)) - (1.5 * Math.sin(b));

    const tc =  4 * (cordinate.longitude - lstm) + eot;
    const lst = getTimeInHours(date) + (tc / 60);

    return 15 * (lst - 12);
}

export const calculateSunPosition = (cordinate: CityCordinate, date: Date): SunPosition => {
    const days = getDaysIntoYear(date);
    const declinationAngle = calculateDeclinationAngle(days);
    
    const dR = declinationAngle * MathUtils.DEG2RAD; // Decliation In Radians;
    const ltR = cordinate.latitude * MathUtils.DEG2RAD; // Latitude in Radians;


    const t =  getTimeInHours(date);
    const hourAngle = getHourAngle(date, days, cordinate);
    const hR = hourAngle * MathUtils.DEG2RAD; // Hour Angle in Radians;

    const elevationAngle = Math.asin((Math.sin(dR) * Math.sin(ltR)) + (Math.cos(dR) * Math.cos(ltR) * Math.cos(hR)));
    let azimuthAngle = Math.acos((Math.sin(dR) * Math.cos(ltR) - (Math.cos(dR) * Math.sin(ltR) * Math.cos(hR))) / Math.cos(elevationAngle));

    const elevationAngleD = elevationAngle * MathUtils.RAD2DEG;
    let azimuthAngleD = azimuthAngle * MathUtils.RAD2DEG;
    azimuthAngleD = hourAngle > 0 ? 360 - azimuthAngleD : azimuthAngleD;

    return {
        elevation: elevationAngleD,
        azimuth: azimuthAngleD
    };
}