import { Action } from '@ngrx/store';
import { GeometryObject } from 'geojson';
import { AlgorithmTask } from '../models/tasks.model';

export enum AlgorithmsActionTypes {
	SET_DRAW_INDICATOR = '[Algorithms] Set draw indicator',
	SET_REGION_LENGTH = '[Algorithms] Set region length',
	SET_REGION = '[Algorithms] Set region',

	LOAD_TASKS = '[Algorithms] Load tasks',
	DELETE_TASK = '[Algorithms] Delete task',
	ADD_TASKS = '[Algorithms] ADD_TASKS',
	ADD_TASK = '[Algorithms] ADD_TASK',
	RUN_TASK = '[Algorithms] RUN_TASK',
	SELECT_TASK = '[Algorithms] SELECT_TASK'
}

export type TasksActions =
	SetTaskDrawIndicator
	| SetTaskRegion
	;

export class SetTaskDrawIndicator implements Action {
	type = AlgorithmsActionTypes.SET_DRAW_INDICATOR;

	constructor(public payload: boolean) {
	}
}

export class SetTaskRegionLength implements Action {
	type = AlgorithmsActionTypes.SET_REGION_LENGTH;

	constructor(public payload: number) {
	}
}

export class SetTaskRegion implements Action {
	type = AlgorithmsActionTypes.SET_REGION;

	constructor(public payload: GeometryObject) {
	}
}

export class LoadTasksAction implements Action {
	type = AlgorithmsActionTypes.LOAD_TASKS;

	constructor(public payload?: AlgorithmTask[]) {
	}
}

export class AddTasksAction implements Action {
	type = AlgorithmsActionTypes.ADD_TASKS;

	constructor(public payload: AlgorithmTask[]) {
	}
}

export class AddTaskAction implements Action {
	type = AlgorithmsActionTypes.ADD_TASK;

	constructor(public payload: AlgorithmTask) {
	}
}

export class RunTaskAction implements Action {
	type = AlgorithmsActionTypes.RUN_TASK;

	constructor(public payload: AlgorithmTask) {
	}
}

export class DeleteTaskAction implements Action {
	type = AlgorithmsActionTypes.DELETE_TASK;

	constructor(public payload: string) {
	}
}

export class SelectTaskAction implements Action {
	type = AlgorithmsActionTypes.SELECT_TASK;

	constructor(public payload: AlgorithmTask) {
	}
}
