import { Case } from '../../models/case.model';
import { Params } from '@angular/router';
import { cloneDeep } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import * as rison from 'rison';
import { CaseMapsState, CaseMapState } from '@ansyn/core/models';
import { Context } from '../../models/context.model';
import { Point } from 'geojson';
import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { getPolygonByPoint } from '../../../../core/utils/geo';

export class QueryParamsHelper{

	constructor(private casesService: CasesService) {}

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
		if(selected_context.region) {
			case_model.state.region = selected_context.region;
		}
		if(selected_context.facets) {
			case_model.state.facets = selected_context.facets;
		}
		if(selected_context.time) {
			case_model.state.time = selected_context.time;
		}
		if(selected_context.layout_index) {
			case_model.state.maps.layouts_index = selected_context.layout_index;
		}
		if(selected_context.geoFilter) {
			case_model.state.geoFilter = selected_context.geoFilter;
		}
		if(selected_context.orientation) {
			case_model.state.orientation = selected_context.orientation;
		}

		if(selected_context.requirements) {
			selected_context.requirements.forEach((requireKey: string) => {
				switch (requireKey) {
					case 'geopoint':
						const geopointStr = q_params['geopoint'];
						if(geopointStr){
							const coordinates = geopointStr.split(',').map(strToNum => +strToNum);
							const geoPoint: Point = {type:'Point', coordinates};
							case_model.state.maps.data.forEach(map => map.data.position.center = geoPoint);
							case_model.state.region = getPolygonByPoint(coordinates).geometry;
						} else {
							const coordinates = getPointByPolygon(case_model.state.region).coordinates;
							const geoPoint: Point = {type:'Point', coordinates};
							case_model.state.maps.data.forEach(map => map.data.position.center = geoPoint);
							case_model.state.region = getPolygonByPoint(coordinates).geometry;
						}
						break;
				}
			})
		}

		if(selected_context.zoom) {
			const point: Point = getPointByPolygon(case_model.state.region);
			const a_id = case_model.state.maps.active_map_id;
			const a_map = case_model.state.maps.data.find(map => map.id === a_id);
			a_map.data.position.center = point;
			case_model.state.maps.data.forEach((map) => map.data.position.zoom = selected_context.zoom);
		}

		if(selected_context.imageryCount){
			this.casesService.contextValus.imageryCount = +selected_context.imageryCount;
		}

		this.casesService.contextValus.displayOverlay = selected_context.defaultOverlay;
	}

	generateQueryParamsViaCase(s_case: Case): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		const keys = this.casesService.queryParamsKeys.filter( key => s_case.state[key]);
		keys.forEach(key => {
			const decodedValue = this.encodeCaseObjects(key, s_case.state[key]);
			urlTree.queryParams[key] = decodedValue;
		});
		const baseLocation = this.casesService.config.useHash ? `${location.origin}/#` : location.origin ;
		return decodeURIComponent(`${baseLocation}${urlTree.toString()}`);
	}

	encodeCaseObjects(key, value) {
		switch (key) {
			case "facets":
				return rison.encode(value);
			case "time":
				return rison.encode(value);
			case "maps":
				const clonedvalue: CaseMapsState = cloneDeep(value);
				clonedvalue.data.forEach((caseMapState: CaseMapState )=> {
					if(caseMapState.data.overlay){
						caseMapState.data.overlay= <any>{id: caseMapState.data.overlay.id}
					}
				});
				return rison.encode(clonedvalue);
			case "region":
				return wellknown.stringify(value);
			default:
				return wellknown.stringify(value);
		}
	}

	decodeCaseObjects(key, value) {
		switch (key) {
			case "facets":
				return rison.decode(value);
			case "time":
				return rison.decode(value);
			case "maps":
				return rison.decode(value);
			case "region":
				return wellknown.parse(value);
			default:
				return rison.decode(value);
		}
	}
}
