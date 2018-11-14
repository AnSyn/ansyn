import { Action } from '@ngrx/store';
import { GeometryObject } from 'geojson';
import { AlgorithmTask } from '../models/algorithms.model';

export enum AlgorithmsActionTypes {
	SET_DRAW_INDICATOR = '[Algorithms] Set draw indicator',
	SET_REGION_LENGTH = '[Algorithms] Set region length',
	SET_REGION = '[Algorithms] Set region',

	LOAD_TASKS = '[Algorithms] Load tasks',
	DELETE_TASK = '[Algorithms] Delete task',
	OPEN_MODAL = '[Algorithms] OPEN_MODAL',
	CLOSE_MODAL = '[Algorithms] CLOSE_MODAL',
	ADD_TASKS = '[Algorithms] ADD_TASKS',
	ADD_TASK = '[Algorithms] ADD_TASK',
	SELECT_TASK = '[Algorithms] SELECT_TASK'
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

export class SetAlgorithmTaskRegionLength implements Action {
	type = AlgorithmsActionTypes.SET_REGION_LENGTH;

	constructor(public payload: number) {
	}
}

export class SetAlgorithmTaskRegion implements Action {
	type = AlgorithmsActionTypes.SET_REGION;

	constructor(public payload: GeometryObject) {
	}
}

export class LoadAlgorithmTasksAction implements Action {
	type = AlgorithmsActionTypes.LOAD_TASKS;

	constructor(public payload?: AlgorithmTask[]) {
	}
}

export class AddAlgorithmTasksAction implements Action {
	type = AlgorithmsActionTypes.ADD_TASKS;

	constructor(public payload: AlgorithmTask[]) {
	}
}

export class AddAlgorithmTaskAction implements Action {
	type = AlgorithmsActionTypes.ADD_TASK;

	constructor(public payload: AlgorithmTask) {
	}
}

export class DeleteAlgorithmTaskAction implements Action {
	type = AlgorithmsActionTypes.DELETE_TASK;

	constructor(public payload: string) {
	}
}

export class OpenModalAction implements Action {
	type = AlgorithmsActionTypes.OPEN_MODAL;

	constructor(public payload: { component: any, taskId?: string }) {
	}
}

export class CloseModalAction implements Action {
	type = AlgorithmsActionTypes.CLOSE_MODAL;

	constructor(public payload?: any) {
	}
}

export class SelectAlgorithmTaskAction implements Action {
	type = AlgorithmsActionTypes.SELECT_TASK;

	constructor(public payload: AlgorithmTask) {
	}
}
