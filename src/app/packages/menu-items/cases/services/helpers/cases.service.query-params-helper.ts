
import { Case } from '../../models/case.model';
import { Params } from '@angular/router';
import { cloneDeep } from 'lodash';
import { CasesService } from '../cases.service';
import * as wellknown from 'wellknown';
import * as rison from 'rison';

export class QueryParamsHelper{

	constructor(private casesService: CasesService){}

	updateCaseViaQueryParmas(defaultCase: Case, q_params: Params) {
		const s_case = cloneDeep(defaultCase);
		const q_params_keys = Object.keys(q_params);
		q_params_keys.forEach((key) => {
			const encodedValue = this.decodeCaseObjects(key, q_params[key]);
			s_case.state[key] = encodedValue;
		});
		return s_case;
	}

	generateQueryParamsViaCase(s_case: Case): string {
		const url = `/`;
		const urlTree = this.casesService.urlSerializer.parse(url);
		let keys = ['facets', 'time', 'maps', 'region'];
		keys = keys.filter( key => s_case.state[key]);
		keys.forEach(key => {
			const decodedValue = this.encodeCaseObjects(key, s_case.state[key]);
			urlTree.queryParams[key] = decodedValue;
		});
		return decodeURIComponent(`${location.origin}${urlTree.toString()}`);
	}

	encodeCaseObjects(key, value) {
		switch (key) {
			case "facets":
				return rison.encode_object(value);
			case "time":
				value.from = JSON.parse(JSON.stringify(value.from));
				value.to = JSON.parse(JSON.stringify(value.to));
				return rison.encode_object(value);
			case "maps":
				return rison.encode_object(value);
			case "region":
				return wellknown.stringify(value);
			default:
				return wellknown.stringify(value);
		}
	}

	decodeCaseObjects(key, value) {
		switch (key) {
			case "facets":
				return rison.decode_object(value);
			case "time":
				return rison.decode_object(value);
			case "maps":
				return rison.decode_object(value);
			case "region":
				return wellknown.parse(value);
			default:
				return rison.decode_object(value);
		}
	}
}
