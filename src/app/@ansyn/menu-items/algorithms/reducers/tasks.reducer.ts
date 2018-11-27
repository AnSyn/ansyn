import { ITasksState } from './tasks.reducer';
import { TasksActions, TasksActionTypes } from '../actions/tasks.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { AlgorithmTask, AlgorithmTaskPreview, TasksPageToShow } from '../models/tasks.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary } from '@ngrx/entity/src/models';
import { UUID } from 'angular2-uuid';

export const tasksAdapter: EntityAdapter<AlgorithmTaskPreview> = createEntityAdapter<AlgorithmTaskPreview>(
	{ sortComparer: (ob1: AlgorithmTaskPreview, ob2: AlgorithmTaskPreview): number => +ob2.creationTime - +ob1.creationTime });

export interface ITasksState extends EntityState<AlgorithmTaskPreview> {
	drawIndicator: boolean;
	selectedTaskId: string;
	currentTask: AlgorithmTask;
	pageToShow: TasksPageToShow;
	loading: boolean;
}

export const initialTasksState: ITasksState = tasksAdapter.getInitialState(<ITasksState>{
	drawIndicator: false,
	selectedTaskId: null,
	pageToShow: TasksPageToShow.TASKS_TABLE,
	currentTask: null,
	loading: false
});

export const tasksFeatureKey = 'tasks';
export const tasksStateSelector: MemoizedSelector<any, ITasksState> = createFeatureSelector<ITasksState>(tasksFeatureKey);

export function TasksReducer(state: ITasksState = initialTasksState, action: TasksActions | any): ITasksState {
	switch (action.type) {

		case TasksActionTypes.SET_DRAW_INDICATOR: {
			return { ...state, drawIndicator: action.payload };
		}

		case TasksActionTypes.SELECT_TASK: {
			return { ...state, selectedTaskId: action.payload };
		}

		case TasksActionTypes.SET_PAGE_TO_SHOW: {
			return { ...state, pageToShow: action.payload };
		}

		case TasksActionTypes.SET_LOADING_FLAG: {
			return { ...state, loading: action.payload };
		}

		case TasksActionTypes.SET_CURRENT_TASK: {
			return { ...state, currentTask: action.payload };
		}

		case TasksActionTypes.SET_CURRENT_TASK_ALGORITHM_NAME: {
			return { ...state, currentTask: { ...state.currentTask, algorithmName: action.payload } };
		}

		case TasksActionTypes.SET_CURRENT_TASK_NAME: {
			return { ...state, currentTask: { ...state.currentTask, name: action.payload } };
		}

		case TasksActionTypes.SET_CURRENT_TASK_REGION: {
			return {
				...state,
				currentTask: { ...state.currentTask, state: { ...state.currentTask.state, region: action.payload } }
			};
		}

		case TasksActionTypes.SET_CURRENT_TASK_OVERLAYS: {
			return {
				...state,
				currentTask: { ...state.currentTask, state: { ...state.currentTask.state, overlays: action.payload } }
			};
		}

		case TasksActionTypes.SET_CURRENT_TASK_MASTER_OVERLAY: {
			return {
				...state,
				currentTask: { ...state.currentTask, state: { ...state.currentTask.state, masterOverlay: action.payload }
				}
			};
		}

		case TasksActionTypes.ADD_TASK:
			let task: AlgorithmTask = action.payload;
			task.id = UUID.UUID();
			task.creationTime = new Date();
			return tasksAdapter.addOne(task, state);

		case TasksActionTypes.DELETE_TASK:
			return tasksAdapter.removeOne(action.payload, state);

		case TasksActionTypes.ADD_TASKS:
			return tasksAdapter.addMany(action.payload, state);

		default:
			return state;
	}

}

export const { selectEntities, selectAll, selectTotal, selectIds } = tasksAdapter.getSelectors();
export const selectTaskTotal = createSelector(tasksStateSelector, selectTotal);
export const selectTaskEntities = <MemoizedSelector<ITasksState, Dictionary<AlgorithmTaskPreview>>>createSelector(tasksStateSelector, selectEntities);
export const selectTasksIds = <MemoizedSelector<any, string[] | number[]>>createSelector(tasksStateSelector, selectIds);

export const selectAlgorithmTaskDrawIndicator: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.drawIndicator);
export const selectAlgorithmTasksPageToShow: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.pageToShow);
export const selectAlgorithmTasksLoadingFlag: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.loading);
export const selectAlgorithmTasksSelectedTaskId: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.selectedTaskId);
export const selectAlgorithmTasksSelectedTask: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => {
	return !algorithmsState.selectedTaskId ?
		null :
		selectEntities(algorithmsState)[algorithmsState.selectedTaskId]
});

export const selectCurrentAlgorithmTask: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.currentTask);
export const selectCurrentAlgorithmTaskStatus: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.currentTask && algorithmsState.currentTask.status);
export const selectCurrentAlgorithmTaskName: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.currentTask && algorithmsState.currentTask.name);
export const selectCurrentAlgorithmTaskAlgorithmName: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.currentTask && algorithmsState.currentTask.algorithmName);
export const selectCurrentAlgorithmTaskOverlays: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.currentTask && algorithmsState.currentTask.state && algorithmsState.currentTask.state.overlays || []);
export const selectCurrentAlgorithmTaskMasterOverlay: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.currentTask && algorithmsState.currentTask.state && algorithmsState.currentTask.state.masterOverlay);
export const selectCurrentAlgorithmTaskRegion: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.currentTask && algorithmsState.currentTask.state && algorithmsState.currentTask.state.region);

