import { Case } from '../../models/case.model';
import { Params } from '@angular/router';
import { cloneDeep, isEmpty } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import * as rison from 'rison';
import { CaseMapsState, CaseMapState } from '@ansyn/core/models';
import { Context } from '../../models/context.model';
import { Point } from 'geojson';
import { getPolygonByPoint } from '@ansyn/core/utils/geo';

export class QueryParamsHelper {

	constructor(private casesService: CasesService) {
	}

	get defaultCase() {
		return this.casesService.config.defaultCase;
	}

	updateCaseViaQueryParmas(q_params: Params = {}, defaultCase: Case = this.defaultCase) {
		const s_case = cloneDeep(defaultCase);
		const q_params_keys = Object.keys(q_params);
		q_params_keys.forEach((key) => {
			s_case.state[key] = this.decodeCaseObjects(key, q_params[key]);
		});
		return s_case;
	}

	updateCaseViaContext(selectedContext: Context, caseModel: Case, qParams: Params = {}) {
		if (selectedContext.id === 'default') {
			return { ...this.defaultCase, name: caseModel.name };
		}
		let updatedCaseModel = cloneDeep(caseModel);
		updatedCaseModel.state.selected_context_id = selectedContext.id;
		['region', 'facets', 'time', 'layout_index', 'geoFilter', 'orientation'].forEach(key => {
			if (selectedContext[key]) {
				updatedCaseModel.state[key] = selectedContext[key];
			}
		});

		['defaultOverlay', 'imageryCount'].forEach(key => {
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
							const coordinates = geopointStr.split(',').map(strToNum => +strToNum).reverse();
							const geoPoint: Point = { type: 'Point', coordinates };
							updatedCaseModel.state.maps.data.forEach(map => map.data.position.center = geoPoint);
							updatedCaseModel.state.region = getPolygonByPoint(coordinates).geometry;
						}
						break;
				}
			});
		}

		return updatedCaseModel;
	}

	generateQueryParamsViaCase(s_case: Case): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		const keys = this.casesService.queryParamsKeys.filter(key => s_case.state[key]);
		keys.forEach(key => {
			urlTree.queryParams[key] = this.encodeCaseObjects(key, s_case.state[key]);
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
						caseMapState.data.overlay = <any>{ id: caseMapState.data.overlay.id };
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
