import { IContext } from '../../../../core/models/context.model';
import { Params } from '@angular/router';
import { cloneDeep, mapValues } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import * as rison from 'rison';
import * as turf from '@turf/turf';
import { bbox, bboxPolygon, centroid, point } from '@turf/turf';
import { Feature, GeoJsonObject, Point, Polygon } from 'geojson';
import { UUID } from 'angular2-uuid';
import {
	getPolygonByPointAndRadius,

} from '@ansyn/imagery';
import {
	ICase,
	ICaseMapsState,
	ICaseMapState,
	ICaseState,
	ImageManualProcessArgs,
	IOverlaysManualProcessArgs
} from '../../models/case.model';
import { IOverlay, IDilutedOverlaysHash, IOverlaysHash } from '../../../../overlays/models/overlay.model';

export class QueryParamsHelper {
	constructor(protected casesService: CasesService) {
	}

	get defaultCase() {
		return this.casesService.config.defaultCase;
	}

	updateCaseViaQueryParmas(qParams: Params = {}, defaultCase: ICase = this.defaultCase) {
		const sCase = cloneDeep(defaultCase);
		sCase.state.overlaysManualProcessArgs = <IOverlaysManualProcessArgs>sCase.state.overlaysManualProcessArgs;
		// needed for ngc
		const qParamsKeys = Object.keys(qParams);
		qParamsKeys.forEach((key) => {
			sCase.state[key] = this.decodeCaseObjects(key, qParams[key]);
		});
		return this.casesService.parseCase(sCase);
	}

	updateCaseViaContext(selectedContext: IContext, caseModel: ICase, qParams: Params = {}) {
		if (selectedContext.id === 'default') {
			return { ...this.defaultCase, name: caseModel.name };
		}
		let updatedCaseModel = cloneDeep(caseModel);
		// needed for ngc
		updatedCaseModel.selectedContextId = selectedContext.id;
		['region', 'facets', 'time', 'layoutIndex', 'orientation'].forEach(key => {
			if (selectedContext[key]) {
				updatedCaseModel.state[key] = selectedContext[key];
			}
		});

		if (selectedContext.requirements && Boolean(qParams)) {
			this.updateCaseViaContextGeometry(updatedCaseModel, selectedContext, qParams);
		}

		return this.casesService.parseCase(updatedCaseModel);
	}

	updateCaseViaContextGeometry(updatedCaseModel, selectedContext, qParams): void {
		/* reference */
		selectedContext.requirements.forEach((requireKey: string) => {
			switch (requireKey) {
				case 'geopoint': {
					const { geopoint } = qParams;
					if (geopoint) {
						const coordinates = geopoint.split(',').map(Number).reverse(); // todo: check if reverse is needed?
						const region = turf.geometry('Point', coordinates);
						updatedCaseModel.state.region = region;
						// Put the requested position in the case. This is needed in order to set correct map position, when no overlays are found
						updatedCaseModel.state.maps.data[0].data.position.projectedState = null;
						updatedCaseModel.state.maps.data[0].data.position.extentPolygon = getPolygonByPointAndRadius(coordinates, 1).geometry;
					}
				}
					break;
				case 'geometry':
					const { geometry } = qParams;
					if (geometry) {
						const geoJsonGeomtry = <GeoJsonObject> wellknown.parse(geometry);

						switch (geoJsonGeomtry.type) {
							case 'Point': {
								const geoPoint: Point = <any>geoJsonGeomtry;
								updatedCaseModel.state.region = geoPoint;
								updatedCaseModel.state.contextEntities = [{
									id: UUID.UUID(),
									date: qParams.time ? new Date(qParams.time) : new Date(),
									featureJson: point(geoPoint.coordinates)
								}];
								const extentPolygon = getPolygonByPointAndRadius(geoPoint.coordinates, 1).geometry;
								updatedCaseModel.state.maps.data.forEach(map => {
									map.data.position.projectedState = null;
									map.data.position.extentPolygon = extentPolygon;
								});
							}
								break;
							case 'Polygon': {
								const region = <Polygon>geoJsonGeomtry;
								const feature: Feature<any> = turf.polygon(region.coordinates);
								const centroidOfGeometry = centroid(feature);
								const extentPolygon = bboxPolygon(bbox(feature)).geometry;
								const polygonContextEntity = this.generatContextEntity(qParams.time, feature);
								const centerContextEntity = this.generatContextEntity(qParams.time, centroidOfGeometry);
								const contextEntities = [polygonContextEntity, centerContextEntity];
								const maps = {
									...updatedCaseModel.state.maps,
									data: updatedCaseModel.state.maps.data.map((map) => ({
										...map,
										data: { ...map, position: { projectedState: null, extentPolygon } }
									}))
								};
								updatedCaseModel.state = { ...updatedCaseModel.state, region, maps, contextEntities };
							}
						}
					}
			}
		});
	}

	generatContextEntity(time, featureJson) {
		return {
			id: UUID.UUID(),
			date: time ? new Date(time) : new Date(),
			featureJson
		};
	}

	generateQueryParamsViaCase(sCase: ICase): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		const keys = this.casesService.queryParamsKeys.filter(key => sCase.state[key]);
		keys.forEach(key => {
			urlTree.queryParams[key] = this.encodeCaseObjects(key, sCase.state[key], sCase.state);
		});
		const baseLocation = location.href.split('#')[0];
		const href = this.casesService.config.useHash ? `${baseLocation}/#` : baseLocation;
		return decodeURIComponent(`${href}${urlTree.toString()}`);
	}

	encodeCaseObjects(key, value, caseState?: ICaseState) {
		switch (key) {
			case 'facets':
				return rison.encode(value);
			case 'time':
				return rison.encode({ ...value, from: value.from.toISOString(), to: value.to.toISOString() });
			case 'maps':
				const clonedvalue: ICaseMapsState = cloneDeep(value);
				clonedvalue.data.forEach((caseMapState: ICaseMapState) => {
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
						const loadedOverlay = caseState.maps.data.find((caseMapState: ICaseMapState) => {
							return caseMapState.data.overlay && caseMapState.data.overlay.id === overlayId;
						});
						if (loadedOverlay) {
							activeMapsManualProcessArgs[overlayId] = processArgs;
						}
					});
				}
				return rison.encode(activeMapsManualProcessArgs);
			case 'layers':
				return rison.encode(value.activeLayersIds);
			case 'miscOverlays':
				const miscOverlays: IOverlaysHash = value || {};
				const miscOverlaysDiluted: IDilutedOverlaysHash = mapValues(miscOverlays, (overlay: IOverlay) =>
					overlay ? { id: overlay.id, sourceType: overlay.sourceType } : null);
				return rison.encode(miscOverlaysDiluted);
			default:
				return wellknown.stringify(value);
		}
	}

	decodeCaseObjects(key, value) {
		switch (key) {
			case 'region':
				return wellknown.parse(value);
			case 'layers':
				const selectedLayersIds = rison.decode(value);
				return { activeLayersIds: selectedLayersIds };
			default:
				return rison.decode(value);
		}
	}
}
