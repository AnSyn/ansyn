import { IContext } from '../../../../core/models/context.model';
import { Params } from '@angular/router';
import { cloneDeep, mapValues } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import * as rison from 'rison';
import { bbox, bboxPolygon, polygon } from '@turf/turf';
import { Feature, GeoJsonObject, Point, Polygon } from 'geojson';
import { getPolygonByPointAndRadius, } from '@ansyn/imagery';
import {
	ICase,
	ICaseMapsState,
	ICaseMapState,
	ICaseState,
	ImageManualProcessArgs,
	IOverlaysManualProcessArgs
} from '../../models/case.model';
import { IDilutedOverlaysHash, IOverlay, IOverlaysHash } from '../../../../overlays/models/overlay.model';

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

	generateQueryParamsViaCase(sCase: ICase): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		const keys = this.casesService.queryParamsKeys.filter(key => sCase.state[key]);
		keys.forEach(key => {
			urlTree.queryParams[key] = this.encodeCaseObjects(key, sCase.state[key], sCase.state);
		});
		const baseLocation = location.href.split('#')[0];
		const href = this.casesService.config.useHash ? `${ baseLocation }/#` : baseLocation;
		return decodeURIComponent(`${ href }${ urlTree.toString() }`);
	}

	rot13(s) {
		if (s) {
			return (s ? s : this).split('').map(function (_) {
				if (!_.match(/[A-Za-z]/)) {
					return _;
				}
				const c = Math.floor(_.charCodeAt(0) / 97);
				const k = (_.toLowerCase().charCodeAt(0) - 83) % 26 || 26;
				return String.fromCharCode(k + ((c === 0) ? 64 : 96));
			}).join('');
		}
	}

	encodeCaseObjects(key, value, caseState?: ICaseState) {
		let encodedValue;
		switch (key) {
			case 'dataInputFilters':
				return rison.encode(value);
			case 'facets':
				const compressedFacets = this.casesService.queryCompressorService.compressFacets(value);
				encodedValue = rison.encode(compressedFacets);
				break;
			case 'time':
				encodedValue =  rison.encode({ ...value, from: value.from.getTime(), to: value.to.getTime() });
				break;
			case 'maps':
				const mapData: ICaseMapsState = cloneDeep(value);
				const compressedMapData = this.casesService.queryCompressorService.compressMapsData(mapData);
				encodedValue =  rison.encode(compressedMapData);
				break;
			case 'region':
				encodedValue =  wellknown.stringify(value);
				break;
			case 'orientation':
				encodedValue = rison.encode(value);
				break;
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
							activeMapsManualProcessArgs[overlayId] = this.casesService.queryCompressorService.compressManualImageProcessingData(processArgs);
						}
					});
				}

				encodedValue =  rison.encode(activeMapsManualProcessArgs);
				break;
			case 'layers':
				encodedValue = rison.encode(value.activeLayersIds);
				break;
			case 'miscOverlays':
				const miscOverlays: IOverlaysHash = value || {};
				const miscOverlaysDiluted: IDilutedOverlaysHash = mapValues(miscOverlays, (overlay: IOverlay) =>
					overlay ? { id: overlay.id, sourceType: overlay.sourceType } : null);
				encodedValue = rison.encode(miscOverlaysDiluted);
				break;
			default:
				encodedValue = wellknown.stringify(value);
		}

		const encryptedValue = this.rot13(encodedValue);
		return encryptedValue;
	}


	decodeCaseObjects(key, value) {
		const decodedValue = this.rot13(value);
		switch (key) {
			case 'region':
				return wellknown.parse(decodedValue);
			case 'facets':
				return this.casesService.queryCompressorService.decompressFacets(rison.decode(decodedValue));
			case 'maps':
				return this.casesService.queryCompressorService.decompressMapData(rison.decode(decodedValue));
			case 'overlaysManualProcessArgs':
				const decodedData = rison.decode(decodedValue);
				const keys = Object.keys(decodedData);
				keys.forEach((overlayId) => {
					decodedData[overlayId] = this.casesService.queryCompressorService.decompressManualImageProcessingData(decodedData[overlayId]);
				});
				return decodedData;
			case 'layers':
				const selectedLayersIds = rison.decode(decodedValue);
				return { activeLayersIds: selectedLayersIds };
			default:
				return rison.decode(decodedValue);
		}
	}
}
