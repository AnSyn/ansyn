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

	updateCaseViaQueryParmas(q_params: Params = {}, defaultCase: Case = this.casesService.config.defaultCase) {
		const s_case = cloneDeep(defaultCase);
		const q_params_keys = Object.keys(q_params);
		q_params_keys.forEach((key) => {
			const encodedValue = this.decodeCaseObjects(key, q_params[key]);
			s_case.state[key] = encodedValue;
		});
		return s_case;
	}

	updateCaseViaContext(selected_context: Context, case_model: Case, q_params: Params = {}) {
		['region', 'facets', 'time', 'layout_index', 'geoFilter', 'orientation'].forEach(key => {
			if (selected_context[key]) {
				case_model.state[key] = selected_context[key];
			}
		});

		['defaultOverlay', 'imageryCount'].forEach(key => {
			if (selected_context[key]) {
				this.casesService.contextValues[key] = selected_context[key];
			}
		});

		if (selected_context.requirements && isEmpty(q_params)) {
			selected_context.requirements.forEach((requireKey: string) => {
				switch (requireKey) {
					case 'geopoint':
						const geopointStr = q_params['geopoint'];
						if (geopointStr) {
							const coordinates = geopointStr.split(',').map(strToNum => +strToNum);
							const geoPoint: Point = { type: 'Point', coordinates };
							case_model.state.maps.data.forEach(map => map.data.position.center = geoPoint);
							case_model.state.region = getPolygonByPoint(coordinates).geometry;
						}
						break;
				}
			});
		}


	}

	generateQueryParamsViaCase(s_case: Case): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		const keys = this.casesService.queryParamsKeys.filter(key => s_case.state[key]);
		keys.forEach(key => {
			const decodedValue = this.encodeCaseObjects(key, s_case.state[key]);
			urlTree.queryParams[key] = decodedValue;
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
