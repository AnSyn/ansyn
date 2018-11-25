import { Action } from '@ngrx/store';
import { GeometryObject } from 'geojson';
import { AlgorithmTask, TasksPageToShow } from '../models/tasks.model';
import { IOverlay } from '@ansyn/core';

export enum TasksActionTypes {
	SET_DRAW_INDICATOR = '[Algorithms] Set draw indicator',

	LOAD_TASKS = '[Algorithms] Load tasks',
	DELETE_TASK = '[Algorithms] Delete task',
	ADD_TASKS = '[Algorithms] ADD_TASKS',
	ADD_TASK = '[Algorithms] ADD_TASK',
	RUN_TASK = '[Algorithms] RUN_TASK',
	SELECT_TASK = '[Algorithms] SELECT_TASK',

	SET_PAGE_TO_SHOW = '[Algorithms] SET_PAGE_TO_SHOW',

	SET_CURRENT_TASK = '[Algorithms] SET_CURRENT_TASK',
	SET_CURRENT_TASK_NAME = '[Algorithms] SET_CURRENT_TASK_NAME',
	SET_CURRENT_TASK_ALGORITHM_NAME = '[Algorithms] SET_CURRENT_TASK_ALGORITHM_NAME',
	SET_CURRENT_TASK_REGION = '[Algorithms] Set region',
	SET_CURRENT_TASK_OVERLAYS = '[Algorithms] SET_CURRENT_TASK_OVERLAYS',
	SET_CURRENT_TASK_MASTER_OVERLAY = '[Algorithms] SET_CURRENT_TASK_MASTER_OVERLAY'
}

export type TasksActions =
	SetTaskDrawIndicator
	| SetCurrentTaskRegion
	;

export class SetTaskDrawIndicator implements Action {
	type = TasksActionTypes.SET_DRAW_INDICATOR;

	constructor(public payload: boolean) {
	}
}

export class LoadTasksAction implements Action {
	type = TasksActionTypes.LOAD_TASKS;

	constructor(public payload?: AlgorithmTask[]) {
	}
}

export class AddTasksAction implements Action {
	type = TasksActionTypes.ADD_TASKS;

	constructor(public payload: AlgorithmTask[]) {
	}
}

export class AddTaskAction implements Action {
	type = TasksActionTypes.ADD_TASK;

	constructor(public payload: AlgorithmTask) {
	}
}

export class RunTaskAction implements Action {
	type = TasksActionTypes.RUN_TASK;

	constructor() {
	}
}

export class DeleteTaskAction implements Action {
	type = TasksActionTypes.DELETE_TASK;

	constructor(public payload: string) {
	}
}

export class SelectTaskAction implements Action {
	type = TasksActionTypes.SELECT_TASK;

	constructor(public payload: string) {
	}
}

export class SetTasksPageToShow implements Action {
	type = TasksActionTypes.SET_PAGE_TO_SHOW;

	constructor(public payload: TasksPageToShow) {
	}
}

export class SetCurrentTask implements Action {
	type = TasksActionTypes.SET_CURRENT_TASK;

	constructor(public payload: AlgorithmTask) {
	}
}

export class SetCurrentTaskName implements Action {
	type = TasksActionTypes.SET_CURRENT_TASK_NAME;

	constructor(public payload: string) {
	}
}

export class SetCurrentTaskMasterOverlay implements Action {
	type = TasksActionTypes.SET_CURRENT_TASK_MASTER_OVERLAY;

	constructor(public payload: IOverlay) {
	}
}

export class SetCurrentTaskOverlays implements Action {
	type = TasksActionTypes.SET_CURRENT_TASK_OVERLAYS;

	constructor(public payload: IOverlay[]) {
	}
}

export class SetCurrentTaskRegion implements Action {
	type = TasksActionTypes.SET_CURRENT_TASK_REGION;

	constructor(public payload: GeometryObject) {
	}
}

export class SetCurrentTaskAlgorithmName implements Action {
	type = TasksActionTypes.SET_CURRENT_TASK_ALGORITHM_NAME;

	constructor(public payload: string) {
	}
}
