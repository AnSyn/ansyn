import { ITasksState } from './tasks.reducer';
import { TasksActions, TasksActionTypes } from '../actions/tasks.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { AlgorithmTask, AlgorithmTaskPreview, TasksPageToShow } from '../models/tasks.model';
import { GeometryObject } from 'geojson';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary } from '@ngrx/entity/src/models';
import { UUID } from 'angular2-uuid';

export const tasksAdapter: EntityAdapter<AlgorithmTaskPreview> = createEntityAdapter<AlgorithmTaskPreview>(
	{ sortComparer: (ob1: AlgorithmTaskPreview, ob2: AlgorithmTaskPreview): number => +ob2.creationTime - +ob1.creationTime });

export interface ITasksState extends EntityState<AlgorithmTaskPreview> {
	drawIndicator: boolean;
	regionLengthInMeters: number;
	region: GeometryObject;
	selectedTaskId: string;
	pageToShow: TasksPageToShow;
}

export const initialTasksState: ITasksState = tasksAdapter.getInitialState(<ITasksState>{
	drawIndicator: false,
	regionLengthInMeters: 1000,
	region: null,
	selectedTaskId: null,
	pageToShow: TasksPageToShow.TASKS_TABLE
});

export const tasksFeatureKey = 'tasks';
export const tasksStateSelector: MemoizedSelector<any, ITasksState> = createFeatureSelector<ITasksState>(tasksFeatureKey);

export function TasksReducer(state: ITasksState = initialTasksState, action: TasksActions | any): ITasksState {
	switch (action.type) {

		case TasksActionTypes.SET_DRAW_INDICATOR: {
			return { ...state, drawIndicator: action.payload };
		}

		case TasksActionTypes.SET_REGION_LENGTH: {
			return { ...state, regionLengthInMeters: action.payload };
		}

		case TasksActionTypes.SET_REGION: {
			return { ...state, region: action.payload };
		}

		case TasksActionTypes.SELECT_TASK: {
			return { ...state, selectedTaskId: action.payload };
		}

		case TasksActionTypes.SET_PAGE_TO_SHOW: {
			return { ...state, pageToShow: action.payload };
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
export const selectAlgorithmTaskRegionLength: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.regionLengthInMeters);
export const selectAlgorithmTaskRegion: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.region);
export const selectAlgorithmTasksPageToShow: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.pageToShow);
export const selectAlgorithmTasksSelectedTaskId: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => algorithmsState.selectedTaskId);
export const selectAlgorithmTasksSelectedTask: MemoizedSelector<any, any> = createSelector(tasksStateSelector, (algorithmsState: ITasksState) => {
	return !algorithmsState.selectedTaskId ?
	null :
	selectEntities(algorithmsState)[algorithmsState.selectedTaskId]
});
