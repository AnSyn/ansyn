import { Case } from '../../models/case.model';
import { Params } from '@angular/router';
import { cloneDeep, isEmpty } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import * as rison from 'rison';
import { CaseMapsState, CaseMapState } from '@ansyn/core/models';
import { Context } from '../../models/context.model';
import { Point } from 'geojson';
import { getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import * as centroid from '@turf/centroid';

export class QueryParamsHelper {

	constructor(protected casesService: CasesService) {
	}

	get defaultCase() {
		return this.casesService.config.defaultCase;
	}

	updateCaseViaQueryParmas(qParams: Params = {}, defaultCase: Case = this.defaultCase) {
		const sCase = cloneDeep(defaultCase);
		const qParamsKeys = Object.keys(qParams);
		qParamsKeys.forEach((key) => {
			sCase.state[key] = this.decodeCaseObjects(key, qParams[key]);
		});
		return sCase;
	}

	updateCaseViaContext(selectedContext: Context, caseModel: Case, qParams: Params = {}) {
		if (selectedContext.id === 'default') {
			return { ...this.defaultCase, name: caseModel.name };
		}
		let updatedCaseModel = cloneDeep(caseModel);
		updatedCaseModel.state.selectedContextId = selectedContext.id;
		['region', 'facets', 'time', 'layoutIndex', 'geoFilter', 'orientation'].forEach(key => {
			if (selectedContext[key]) {
				updatedCaseModel.state[key] = selectedContext[key];
			}
		});

		['defaultOverlay', 'imageryCountBefore', 'imageryCountAfter'].forEach(key => {
			if (selectedContext[key]) {
				this.casesService.contextValues[key] = selectedContext[key];
			}
		});

		if (selectedContext.zoom) {
			updatedCaseModel.state.maps.data.forEach(map => map.data.position.zoom = selectedContext.zoom);
		}

		if (selectedContext.requirements && !isEmpty(qParams)) {
			selectedContext.requirements.forEach((requireKey: string) => {
				switch (requireKey) {
					case 'geopoint':
						const geopointStr = qParams.geopoint;
						if (geopointStr) {
							const coordinates = geopointStr.split(',').map(Number).reverse();
							const geoPoint: Point = { type: 'Point', coordinates };
							updatedCaseModel.state.maps.data.forEach(map => map.data.position.center = geoPoint);
							updatedCaseModel.state.region = getPolygonByPointAndRadius(coordinates).geometry;
						}
						break;
					case 'geometry':
						const geometryString = qParams.geometry;
						if (geometryString) {
							const geoJsonGeomtry: GeoJSON.GeoJsonObject = <GeoJSON.GeoJsonObject>wellknown.parse(geometryString);

							if (geoJsonGeomtry.type === 'Point') {
								const geoPoint: Point = <Point>geoJsonGeomtry;
								geoPoint.coordinates = geoPoint.coordinates.reverse();

								updatedCaseModel.state.maps.data.forEach(map => map.data.position.center = geoPoint);
								updatedCaseModel.state.region = getPolygonByPointAndRadius(geoPoint.coordinates).geometry;

								updatedCaseModel.state.contextEntities = [];

								const feature: GeoJSON.Feature<any> = {
									'type': 'Feature',
									'properties': {},
									'geometry': geoPoint
								};

								updatedCaseModel.state.contextEntities.push({
									id: '1',
									date: qParams.time ? new Date(qParams.time) : new Date(),
									featureJson: feature
								});
							} else if (geoJsonGeomtry.type === 'Polygon') {
								const geoPolygon: GeoJSON.Polygon = <GeoJSON.Polygon>geoJsonGeomtry;
								geoPolygon.coordinates[0] = geoPolygon.coordinates[0].map((pair) => pair.reverse());

								const feature: GeoJSON.Feature<any> = {
									'type': 'Feature',
									'geometry': geoPolygon,
									'properties': {}
								};
								const centroidOfGeometry = centroid(feature);

								updatedCaseModel.state.maps.data.forEach(map => map.data.position.center = centroidOfGeometry.geometry);
								updatedCaseModel.state.region = geoPolygon;

								updatedCaseModel.state.contextEntities = [];

								updatedCaseModel.state.contextEntities.push(
									{
										id: '1',
										date: qParams.time ? new Date(qParams.time) : new Date(),
										featureJson: feature
									},
									{
										id: '2',
										date: qParams.time ? new Date(qParams.time) : new Date(),
										featureJson: centroidOfGeometry
									},
								);
							}
						}
						break;
					case 'time':
						this.casesService.contextValues['time'] = qParams.time;
						break;
				}
			});
		}

		return updatedCaseModel;
	}

	generateQueryParamsViaCase(sCase: Case): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		const keys = this.casesService.queryParamsKeys.filter(key => sCase.state[key]);
		keys.forEach(key => {
			urlTree.queryParams[key] = this.encodeCaseObjects(key, sCase.state[key]);
		});
		const baseLocation = this.casesService.config.useHash ? `${location.origin}/#` : location.origin;
		return decodeURIComponent(`${baseLocation}${urlTree.toString()}`);
	}

	encodeCaseObjects(key, value) {
		switch (key) {
			case 'facets':
				return rison.encode(value);
			case 'time':
				return rison.encode(value);
			case 'maps':
				const clonedvalue: CaseMapsState = cloneDeep(value);
				clonedvalue.data.forEach((caseMapState: CaseMapState) => {
					if (caseMapState.data.overlay) {
						caseMapState.data.overlay = <any>{
							id: caseMapState.data.overlay.id,
							sourceType: caseMapState.data.overlay.sourceType,
						};
					}
				});
				return rison.encode(clonedvalue);
			case 'region':
				return wellknown.stringify(value);
			default:
				return wellknown.stringify(value);
		}
	}

	decodeCaseObjects(key, value) {
		switch (key) {
			case 'facets':
				return rison.decode(value);
			case 'time':
				return rison.decode(value);
			case 'maps':
				return rison.decode(value);
			case 'region':
				return wellknown.parse(value);
			default:
				return rison.decode(value);
		}
	}
}
