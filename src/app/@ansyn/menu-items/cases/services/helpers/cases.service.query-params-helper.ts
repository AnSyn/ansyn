import { Case } from '../../models/case.model';
import { Params } from '@angular/router';
import { cloneDeep } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import * as rison from 'rison';
import { getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import { centroid } from '@turf/turf';
import {
	CaseGeoFilter, CaseMapsState, CaseMapState, CaseState, ImageManualProcessArgs,
	OverlaysManualProcessArgs
} from '@ansyn/core/models/case.model';
import { extentFromGeojson } from '@ansyn/core/utils/calc-extent';
import { CaseMapExtent } from '@ansyn/core/models/case-map-position.model';
import { Feature, GeoJsonObject, Point, Polygon } from 'geojson';
import { Context } from '@ansyn/core/models/context.model';

export class QueryParamsHelper {

	constructor(protected casesService: CasesService) {
	}

	get defaultCase() {
		return this.casesService.config.defaultCase;
	}

	updateCaseViaQueryParmas(qParams: Params = {}, defaultCase: Case = this.defaultCase) {
		const sCase = cloneDeep(defaultCase);
		sCase.state.overlaysManualProcessArgs = <OverlaysManualProcessArgs>sCase.state.overlaysManualProcessArgs;
		// needed for ngc
		const qParamsKeys = Object.keys(qParams);
		qParamsKeys.forEach((key) => {
			sCase.state[key] = this.decodeCaseObjects(key, qParams[key]);
		});
		return this.casesService.parseCase(sCase);
	}

	updateCaseViaContext(selectedContext: Context, caseModel: Case, qParams: Params = {}) {
		if (selectedContext.id === 'default') {
			return { ...this.defaultCase, name: caseModel.name };
		}
		let updatedCaseModel = cloneDeep(caseModel);
		updatedCaseModel.state.geoFilter = <CaseGeoFilter>updatedCaseModel.state.geoFilter;
		// needed for ngc
		updatedCaseModel.selectedContextId = selectedContext.id;
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
		if (selectedContext.requirements && Boolean(qParams)) {
			selectedContext.requirements.forEach((requireKey: string) => {
				switch (requireKey) {
					case 'geopoint':
						const geopointStr = qParams.geopoint;
						if (geopointStr) {
							const coordinates = geopointStr.split(',').map(Number).reverse();
							const region = getPolygonByPointAndRadius(coordinates).geometry;
							updatedCaseModel.state.region = region;
						}
						break;
					case 'geometry':
						const geometryString = qParams.geometry;
						if (geometryString) {
							const geoJsonGeomtry: GeoJsonObject = <GeoJsonObject>wellknown.parse(geometryString);

							if (geoJsonGeomtry.type === 'Point') {
								const geoPoint: Point = <any>geoJsonGeomtry;
								geoPoint.coordinates = geoPoint.coordinates.reverse();

								updatedCaseModel.state.region = geoPoint;

								updatedCaseModel.state.contextEntities = [];

								const feature: Feature<any> = {
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
								const geoPolygon: Polygon = <Polygon>geoJsonGeomtry;
								geoPolygon.coordinates[0] = geoPolygon.coordinates[0].map((pair) => pair.reverse());

								const feature: Feature<any> = {
									'type': 'Feature',
									'geometry': geoPolygon,
									'properties': {}
								};
								const centroidOfGeometry = centroid(feature);
								const [x1, y1, x2, y2]: CaseMapExtent = extentFromGeojson(geoPolygon);

								updatedCaseModel.state.maps.data.forEach(map => {
									map.data.position.extentPolygon = {
										type: 'Polygon',
										coordinates: [[
											[x1, y1],
											[x2, y1],
											[x2, y2],
											[x1, y2],
											[x1, y1],
										]]
									}
								});

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
									}
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

		return this.casesService.parseCase(updatedCaseModel);
	}

	generateQueryParamsViaCase(sCase: Case): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		const keys = this.casesService.queryParamsKeys.filter(key => sCase.state[key]);
		keys.forEach(key => {
			urlTree.queryParams[key] = this.encodeCaseObjects(key, sCase.state[key], sCase.state);
		});
		const baseLocation = this.casesService.config.useHash ? `${location.origin}/#` : location.origin;
		return decodeURIComponent(`${baseLocation}${urlTree.toString()}`);
	}

	encodeCaseObjects(key, value, caseState?: CaseState) {
		switch (key) {
			case 'facets':
				return rison.encode(value);
			case 'time':
				return rison.encode({ ...value, from: value.from.toISOString(), to: value.to.toISOString() });
			case 'maps':
				const clonedvalue: CaseMapsState = cloneDeep(value);
				clonedvalue.data.forEach((caseMapState: CaseMapState) => {
					if (caseMapState.data.overlay) {
						caseMapState.data.overlay = <any>{
							id: caseMapState.data.overlay.id,
							sourceType: caseMapState.data.overlay.sourceType
						};
					}
				});
				return rison.encode(clonedvalue);
			case 'region':
				return wellknown.stringify(value);
			case 'orientation':
				return rison.encode(value);
			case 'overlaysManualProcessArgs':
				// collect process arguments only for overlays currently loaded by map
				const activeMapsManualProcessArgs = {};
				if (caseState) {
					const keys = Object.keys(caseState.overlaysManualProcessArgs);
					keys.forEach((overlayId) => {
						const processArgs: ImageManualProcessArgs = caseState.overlaysManualProcessArgs[overlayId];
						const loadedOverlay = caseState.maps.data.find((caseMapState: CaseMapState) => {
							return caseMapState.data.overlay && caseMapState.data.overlay.id === overlayId;
						});
						if (loadedOverlay) {
							activeMapsManualProcessArgs[overlayId] = processArgs;
						}
					});
				}
				return rison.encode(activeMapsManualProcessArgs);
			default:
				return wellknown.stringify(value);
		}
	}

	decodeCaseObjects(key, value) {
		switch (key) {
			case 'region':
				return wellknown.parse(value);
			default:
				return rison.decode(value);
		}
	}
}
