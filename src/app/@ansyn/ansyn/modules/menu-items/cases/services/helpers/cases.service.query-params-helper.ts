import { IContext } from '../../../../core/models/context.model';
import { Params } from '@angular/router';
import { cloneDeep } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import { bbox, bboxPolygon, polygon } from '@turf/turf';
import { Feature, GeoJsonObject, Point, Polygon } from 'geojson';
import { getPolygonByPointAndRadius, } from '@ansyn/imagery';
import { ICase } from '../../models/case.model';
import { take } from 'rxjs/operators';

export const linksConfig = 'linksConfig';

export interface ILinksConfig {
	schema: string;
	idLength: number;
}

export class QueryParamsHelper {
	constructor(protected casesService: CasesService) {
	}

	get defaultCase() {
		return this.casesService.config.defaultCase;
	}

	updateCaseViaQueryParmas(id: string, defaultCase: ICase = this.defaultCase) {
		if (id) {
			this.casesService.storageService.get(this.casesService.linksConfig.schema, id).subscribe(state => {
				console.log('state', state.data);
				const caseData = cloneDeep(defaultCase);
				caseData.state = <any>state.data;
				return this.casesService.parseCase(caseData)
			});
		}

		return this.casesService.parseCase(cloneDeep(defaultCase));
	}

	updateCaseViaContext(selectedContext: IContext, caseModel: ICase, qParams: Params = {}) {
		if (selectedContext.id === 'default') {
			return { ...this.defaultCase, name: caseModel.name };
		}
		let updatedCaseModel = cloneDeep(caseModel);
		// needed for ngc
		updatedCaseModel.selectedContextId = selectedContext.id;
		['dataInputFilters', 'facets', 'time'].forEach(key => {
			if (selectedContext[key]) {
				updatedCaseModel.state[key] = selectedContext[key];
			}
		});

		if (Boolean(qParams.geometry)) {
			this.updateCaseViaContextGeometry(updatedCaseModel, selectedContext, qParams.geometry);
		}

		return this.casesService.parseCase(updatedCaseModel);
	}

	updateCaseViaContextGeometry(updatedCaseModel, selectedContext, geometry): void {
		/* reference */
		const geoJsonGeomtry = <GeoJsonObject>wellknown.parse(geometry);
		if (geoJsonGeomtry.type === 'Point') {
			const geoPoint: Point = <any>geoJsonGeomtry;
			updatedCaseModel.state.region = geoPoint;
			const extentPolygon = getPolygonByPointAndRadius(geoPoint.coordinates, 1).geometry;
			updatedCaseModel.state.maps.data.forEach(map => {
				map.data.position.projectedState = null;
				map.data.position.extentPolygon = extentPolygon;
			});
		} else {
			const region = <Polygon>geoJsonGeomtry;
			const feature: Feature<any> = polygon(region.coordinates);
			const extentPolygon = bboxPolygon(bbox(feature)).geometry;
			const maps = {
				...updatedCaseModel.state.maps,
				data: updatedCaseModel.state.maps.data.map((map) => ({
					...map,
					data: { ...map, position: { projectedState: null, extentPolygon } }
				}))
			};
			updatedCaseModel.state = { ...updatedCaseModel.state, region, maps };
		}
	}

	generateLinkId() {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const { idLength } = this.casesService.linksConfig;
		for (let i = 0; i < idLength; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}

	generateQueryParamsViaCase(sCase: ICase): string {
		const id = this.generateLinkId();
		const link = {
			preview: { id, creationTime: new Date() },
			data: sCase.state
		};

		this.casesService.createLink(link).subscribe();

		const baseLocation = location.href.split('#')[0];
		const href = this.casesService.config.useHash ? `${ baseLocation }#/link/` : baseLocation;
		return decodeURIComponent(`${ href }${ link.preview.id }`);
	}
}
