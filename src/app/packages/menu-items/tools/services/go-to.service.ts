import { Injectable } from '@angular/core';
import * as proj4 from 'proj4';
import { isEqual as _isEqual } from 'lodash';

@Injectable()
export class GoToService {

	constructor() { }

	convertByProjectionDatum(coords, from: any, to: any) {
		if(_isEqual (from, to)) {
			return coords;
		}
		const fromWgs84Geo = from.datum === 'wgs84' && from.projection === 'geo';
		const toWgs84Geo = to.datum === 'wgs84' && to.projection === 'geo';
		const fromEd50Utm = from.datum === 'ed50' && from.projection === 'utm';
		const toEd50Utm = to.datum === 'ed50' && to.projection === 'utm';


		if(fromWgs84Geo && toEd50Utm) {
			const lng = coords[0];
			const zone = (Math.floor((lng + 180) / 6) % 60) + 1;
			const utmProj = `+proj=utm +datum=ed50 +zone=${zone} +ellps=intl +units=m + no_defs`;
			const conv = (<any>proj4).default('EPSG:4326', utmProj, coords);
			return [...conv.map(num => Math.floor(num)), zone];
		}

		if(fromEd50Utm && toWgs84Geo) {
			const zone = coords[2];
			const utmProj = `+proj=utm +datum=ed50 +zone=${zone} +ellps=intl +units=m + no_defs`;
			const conv = (<any>proj4).default(utmProj, 'EPSG:4326', [coords[0], coords[1]]);
			return [...conv.map(num => +num.toFixed(5))];
		}
	}

}
