import { Action, createAction, props } from '@ngrx/store';
import { GeometryObject } from 'geojson';
import { AlgorithmTask, AlgorithmTaskStatus, TasksPageToShow } from '../models/tasks.model';
import { IOverlay } from '../../../overlays/models/overlay.model';

export enum TasksActionTypes {
	SET_DRAW_INDICATOR = '[Algorithms] Set draw indicator',

	LOAD_TASKS = '[Algorithms] Load tasks',
	LOAD_TASKS_FINISHED = '[Algorithms] Load tasks finished',

	RUN_TASK = '[Algorithms] RUN_TASK',
	RUN_TASK_FINISHED = '[Algorithms] RUN_TASK_FINISHED',

	DELETE_TASK = '[Algorithms] Delete task',
	ADD_TASKS = '[Algorithms] ADD_TASKS',
	ADD_TASK = '[Algorithms] ADD_TASK',
	SELECT_TASK = '[Algorithms] SELECT_TASK',

	SET_PAGE_TO_SHOW = '[Algorithms] SET_PAGE_TO_SHOW',

	SET_CURRENT_TASK = '[Algorithms] SET_CURRENT_TASK',
	SET_CURRENT_TASK_NAME = '[Algorithms] SET_CURRENT_TASK_NAME',
	SET_CURRENT_TASK_STATUS = '[Algorithms] SET_CURRENT_TASK_STATUS',
	SET_CURRENT_TASK_ALGORITHM_NAME = '[Algorithms] SET_CURRENT_TASK_ALGORITHM_NAME',
	SET_CURRENT_TASK_REGION = '[Algorithms] Set region',
	SET_CURRENT_TASK_OVERLAYS = '[Algorithms] SET_CURRENT_TASK_OVERLAYS',
	SET_CURRENT_TASK_MASTER_OVERLAY = '[Algorithms] SET_CURRENT_TASK_MASTER_OVERLAY'
}

export const SetTaskDrawIndicator = createAction(
										TasksActionTypes.SET_DRAW_INDICATOR,
										props<{payload: boolean}>()
);

export const LoadTasksAction = createAction(
								TasksActionTypes.LOAD_TASKS,
								props<{payload?: AlgorithmTask[]}>()
);

export const LoadTasksFinishedAction = createAction(
										TasksActionTypes.LOAD_TASKS_FINISHED,
										props<{payload?: AlgorithmTask[]}>()
);

export const AddTasksAction = createAction(
								TasksActionTypes.ADD_TASKS,
								props<{payload?: AlgorithmTask[]}>()
);

export const AddTaskAction = createAction(
								TasksActionTypes.ADD_TASK,
								props<AlgorithmTask>()
);

export const RunTaskAction = createAction(
								TasksActionTypes.RUN_TASK
);

export const RunTaskFinishedAction = createAction(
										TasksActionTypes.RUN_TASK_FINISHED,
										props<AlgorithmTask>()
);

export const DeleteTaskAction = createAction(
									TasksActionTypes.DELETE_TASK,
									props<{payload: string}>()
);

export const SelectTaskAction = createAction(
									TasksActionTypes.SELECT_TASK,
									props<{payload: string}>()
);

export const SetTasksPageToShow = createAction(
									TasksActionTypes.SET_PAGE_TO_SHOW,
									props<{payload: TasksPageToShow}>()
);

export const SetCurrentTask = createAction(
								TasksActionTypes.SET_CURRENT_TASK,
								props<AlgorithmTask>()
);

export const SetCurrentTaskName = createAction(
									TasksActionTypes.SET_CURRENT_TASK_NAME,
									props<{payload: string}>()
);

export const SetCurrentTaskStatus = createAction(
										TasksActionTypes.SET_CURRENT_TASK_STATUS,
										props<{payload: AlgorithmTaskStatus}>()
);

export const SetCurrentTaskMasterOverlay = createAction(
											TasksActionTypes.SET_CURRENT_TASK_MASTER_OVERLAY,
											props<IOverlay>()
);

export const SetCurrentTaskOverlays = createAction(
										TasksActionTypes.SET_CURRENT_TASK_OVERLAYS,
										props<{payload: IOverlay[]}>()
);

export const SetCurrentTaskRegion = createAction(
										TasksActionTypes.SET_CURRENT_TASK_REGION,
										props<{payload: GeometryObject}>()
);

export const SetCurrentTaskAlgorithmName = createAction(
											TasksActionTypes.SET_CURRENT_TASK_ALGORITHM_NAME,
											props<{payload: string}>()
);
