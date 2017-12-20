import { inRange, isEqual } from 'lodash';
import proj4 from 'proj4';
import { Inject, Injectable } from '@angular/core';
import { IToolsConfig, toolsConfig } from '@ansyn/menu-items/tools/models';
import { CoordinatesSystem } from '../models';

export interface UtmZone {
	zone: number;
	utmProj: string;
}

@Injectable()
export class ProjectionConverterService {
	static isValidCoordinates(coords: number[], minLength: number) {
		return coords.length >= minLength && coords.every(c => typeof c === 'number');
	}

	// WGS84 ranges: -90 < lat < 90  -180 < lon <180
	static isValidWGS84(coords: number[]): boolean {
		const coordinatesValid = ProjectionConverterService.isValidCoordinates(coords, 2);
		const validLong = coordinatesValid && inRange(coords[0], -179.9999, 180);
		const validLat = coordinatesValid && inRange(coords[1], -89.9999, 90);
		return validLat && validLong;
	}

	// UTM ranges: -16198192 <= x < 17198193, 0 < zone <= 60
	static isValidUTM(coords: number[]): boolean {
		const coordinatesValid = ProjectionConverterService.isValidCoordinates(coords, 3);
		const validX = coordinatesValid && inRange(coords[0], -16198192, 17198193);
		const validY = coordinatesValid && typeof coords[1] === 'number';
		const validZone = coordinatesValid && inRange(coords[2], 0, 61);
		return validX && validY && validZone;
	}

	constructor(@Inject(toolsConfig) protected toolsConfigProj: IToolsConfig) {
	}

	// isValidConversion
	isValidConversion(coords: number[], from: CoordinatesSystem): boolean {
		let isValid = Boolean(coords);

		const fromWgs84Geo = from.datum === 'wgs84' && from.projection === 'geo';
		const fromEd50Utm = from.datum === 'ed50' && from.projection === 'utm';

		if (isValid && fromWgs84Geo) {
			isValid = ProjectionConverterService.isValidWGS84(coords);
		}

		if (isValid && fromEd50Utm) {
			isValid = ProjectionConverterService.isValidUTM(coords);
		}
		return isValid;
	}


	convertByProjectionDatum(coords: number[], from: CoordinatesSystem, to: CoordinatesSystem) {
		if (isEqual(from, to)) {
			return [...coords];
		}
		const fromWgs84Geo = from.datum === 'wgs84' && from.projection === 'geo';
		const toWgs84Geo = to.datum === 'wgs84' && to.projection === 'geo';
		const fromEd50Utm = from.datum === 'ed50' && from.projection === 'utm';
		const toEd50Utm = to.datum === 'ed50' && to.projection === 'utm';


		if (fromWgs84Geo && toEd50Utm) {
			const lng = coords[0];
			const hemisphere = coords[1];
			const zoneUtmProj = this.getZoneUtmProj(lng, hemisphere);
			const conv = proj4('EPSG:4326', zoneUtmProj.utmProj, coords);
			if (conv[1] < 0) {
				conv[1] += 10000000;
			}
			console.log(conv);
			return [...conv, zoneUtmProj.zone];
		}

		if (fromEd50Utm && toWgs84Geo) {
			const zone = coords[2];
			const utmProj = this.getUtmFromConf(zone);
			const y = coords[1] > 5000000 ? coords[1] - 10000000 : coords[1];
			const conv = proj4(utmProj, 'EPSG:4326', [coords[0], y]);
			return [...conv];
		}
	}

	// leave hemisphere alone for future use :)
	getZoneUtmProj(lng: number, hemisphere: number): UtmZone {
		// source of calculation: https://www.uwgb.edu/dutchs/UsefulData/UTMFormulas.HTM
		const zone = (Math.floor((lng + 180) / 6) % 60) + 1;
		return { zone: zone, utmProj: this.getUtmFromConf(zone) };
	}

	getUtmFromConf(zone: number): string {
		return this.toolsConfigProj.Proj4.ed50.replace('${zone}', zone.toString());
	}
}
