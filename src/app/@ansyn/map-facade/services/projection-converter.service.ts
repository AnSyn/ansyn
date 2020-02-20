import { inRange, isEqual } from 'lodash';
import proj4 from 'proj4';
import { Inject, Injectable } from '@angular/core';
import { IMapFacadeConfig } from '../models/map-config.model';
import { mapFacadeConfig } from '../models/map-facade.config';

export interface IUtmZone {
	zone: number;
	utmProj: string;
}

export interface ICoordinatesSystem {
	datum: 'wgs84' | 'ed50';
	projection: 'geo' | 'utm';
}


// @dynamic
@Injectable()
export class ProjectionConverterService {
	static isValidCoordinates(coords: number[], minLength: number) {
		return coords.length >= minLength && coords.every(c => typeof c === 'number');
	}

	// GEO WGS84 ranges: -90 < lat < 90  -180 < lon <180
	static isValidGeoWGS84(coords: number[]): boolean {
		const coordinatesValid = ProjectionConverterService.isValidCoordinates(coords, 2);
		const validLong = inRange(coords[0], -179.9999, 180);
		const validLat = inRange(coords[1], -89.9999, 90);
		return coordinatesValid && validLat && validLong;
	}

	// UTM ED50 ranges: -16198192 <= x < 17198193, 0 < zone <= 60
	static isValidUTMED50(coords: number[]): boolean {
		const coordinatesValid = ProjectionConverterService.isValidCoordinates(coords, 3);
		const validX = inRange(coords[0], -16198192, 17198193);
		const validY = typeof coords[1] === 'number';
		const validZone = inRange(coords[2], 0, 61);
		return coordinatesValid && validX && validY && validZone;
	}

	static isValidUTMWGS84(coords: number[]): boolean {
		const coordinatesValid = ProjectionConverterService.isValidCoordinates(coords, 3);
		const validX = inRange(coords[0], -16198192, 17198193);
		const validY = typeof coords[1] === 'number';
		const validZone = inRange(coords[2], 0, 61);
		return coordinatesValid && validX && validY && validZone;
	}

	constructor(@Inject(mapFacadeConfig) protected mapfacadeConfigProj: IMapFacadeConfig) {
	}

	// isValidConversion
	isValidConversion(coords: number[], from: ICoordinatesSystem): boolean {
		let isValid = Boolean(coords);

		const fromWgs84Geo = from.datum === 'wgs84' && from.projection === 'geo';
		const fromWgs84Utm = from.datum === 'wgs84' && from.projection === 'utm';
		const fromEd50Utm = from.datum === 'ed50' && from.projection === 'utm';

		if (isValid && fromWgs84Geo) {
			isValid = ProjectionConverterService.isValidGeoWGS84(coords);
		}

		if (isValid && fromEd50Utm) {
			isValid = ProjectionConverterService.isValidUTMED50(coords);
		}

		if (isValid && fromWgs84Utm) {
			isValid = ProjectionConverterService.isValidUTMWGS84(coords);
		}

		return isValid;
	}


	convertByProjectionDatum(coords: number[], from: ICoordinatesSystem, to: ICoordinatesSystem) {

		if (isEqual(from, to)) {
			return [...coords];
		}
		const fromWgs84Geo = from.datum === 'wgs84' && from.projection === 'geo';
		const toWgs84Geo = to.datum === 'wgs84' && to.projection === 'geo';

		const fromWgs84Utm = from.datum === 'wgs84' && from.projection === 'utm';
		const toWgs84Utm = to.datum === 'wgs84' && to.projection === 'utm';

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
			return [...conv, zoneUtmProj.zone];
		}

		if (fromEd50Utm && toWgs84Geo) {
			let [x, y, zone] = coords;
			if (y > 5000000) {
				y -= 10000000;
			}
			const utmProj = this.getUtmFromConf(zone);
			const conv = proj4(utmProj, 'EPSG:4326', [x, y]);
			return [...conv];
		}

		if (fromWgs84Geo && toWgs84Utm) {
			const lng = coords[0];
			const zone = (Math.floor((lng + 180) / 6) % 60) + 1;
			const projection = '+proj=utm +zone$(zone) +datum=WGS84'.replace('$(zone)', zone.toString());
			const conv = proj4('EPSG:4326', projection, coords);
			if (conv[1] < 0) {
				conv[1] += 10000000;
			}
			return [...conv, zone];
		}

		if (fromWgs84Utm && toWgs84Geo) {
			let [x, y, zone] = coords;
			if (y > 5000000) {
				y -= 10000000;
			}
			const utmProj = '+proj=utm +zone$(zone) +datum=WGS84'.replace('$(zone)', zone.toString());
			const conv = proj4(utmProj, 'EPSG:4326', [x, y]);
			return [...conv];
		}
	}

	// leave hemisphere alone for future use :)
	getZoneUtmProj(lng: number, hemisphere: number): IUtmZone {
		// source of calculation: https://www.uwgb.edu/dutchs/UsefulData/UTMFormulas.HTM
		const zone = (Math.floor((lng + 180) / 6) % 60) + 1;
		return { zone: zone, utmProj: this.getUtmFromConf(zone) };
	}

	getUtmFromConf(zone: number): string {
		return this.mapfacadeConfigProj.Proj4.ed50.replace('${zone}', zone.toString());
	}
}
