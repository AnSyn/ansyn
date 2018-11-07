import { Action } from '@ngrx/store';
import { GeometryObject } from 'geojson';

export enum AlgorithmsActionTypes {
	SET_DRAW_INDICATOR = '[Algorithms] Set draw indicator',
	SET_REGION = '[Algorithms] Set region'
}

export type AlgorithmsActions =
	SetAlgorithmTaskDrawIndicator
	| SetAlgorithmTaskRegion
	;

export class SetAlgorithmTaskDrawIndicator implements Action {
	type = AlgorithmsActionTypes.SET_DRAW_INDICATOR;

	constructor(public payload: boolean) {
	}
}

export class SetAlgorithmTaskRegion implements Action {
	type = AlgorithmsActionTypes.SET_REGION;

	constructor(public payload: GeometryObject) {
	}
}
