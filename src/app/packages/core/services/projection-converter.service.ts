import { isEqual as _isEqual } from 'lodash';
import * as proj4 from 'proj4';
import { Inject, Injectable } from '@angular/core';
import { IToolsConfig, toolsConfig } from '@ansyn/menu-items/tools/models';
import { CoordinatesSystem } from '../models';

export interface UtmZone {
	zone: number;
	utmProj: string;
}

@Injectable()
export class ProjectionConverterService {
	constructor(@Inject(toolsConfig) protected toolsConfigProj: IToolsConfig) {
	}

	convertByProjectionDatum(coords: number[], from: CoordinatesSystem, to: CoordinatesSystem) {
		if (_isEqual(from, to)) {
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
			const conv = (<any>proj4).default('EPSG:4326', zoneUtmProj.utmProj, coords);
			return [...conv, zoneUtmProj.zone];
		}

		if (fromEd50Utm && toWgs84Geo) {
			const zone = coords[2];
			const utmProj = this.getUtmFromConf(zone);
			const conv = (<any>proj4).default(utmProj, 'EPSG:4326', [coords[0], coords[1]]);
			return [...conv];
		}
	}

	getZoneUtmProj(lng: number, hemisphere: number): UtmZone {
		const zone = (Math.floor((lng + 180) / 6) % 60) + 1;
		return { zone: zone, utmProj: this.getUtmFromConf(zone) };
	}

	getUtmFromConf(zone: number): string {
		return this.toolsConfigProj.Proj4.ed50.replace('${zone}', zone.toString())
	}
}
