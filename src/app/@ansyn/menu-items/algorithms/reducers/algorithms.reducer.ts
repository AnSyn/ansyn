import { IAlgorithmState } from './algorithms.reducer';
import { AlgorithmsActions, AlgorithmsActionTypes } from '../actions/algorithms.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { AlgorithmTask, AlgorithmTaskPreview } from '../models/algorithms.model';
import { GeometryObject } from 'geojson';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary } from '@ngrx/entity/src/models';

export const algorithmsAdapter: EntityAdapter<AlgorithmTaskPreview> = createEntityAdapter<AlgorithmTaskPreview>();

export interface ITaskModal {
	show: boolean,
	id?: string
}

export interface IAlgorithmState extends EntityState<AlgorithmTaskPreview> {
	drawIndicator: boolean;
	regionLengthInMeters: number;
	region: GeometryObject;
	selectedTask: AlgorithmTask;
	modal: ITaskModal;
}

export const initialAlgorithmsState: IAlgorithmState = algorithmsAdapter.getInitialState(<IAlgorithmState>{
	drawIndicator: false,
	regionLengthInMeters: 1000,
	region: null,
	selectedTask: null,
	modal: { show: false }
});

export const algorithmsFeatureKey = 'algorithms';
export const algorithmsStateSelector: MemoizedSelector<any, IAlgorithmState> = createFeatureSelector<IAlgorithmState>(algorithmsFeatureKey);

export function AlgorithmsReducer(state: IAlgorithmState = initialAlgorithmsState, action: AlgorithmsActions | any): IAlgorithmState {
	switch (action.type) {

		case AlgorithmsActionTypes.SET_DRAW_INDICATOR: {
			return { ...state, drawIndicator: action.payload };
		}

		case AlgorithmsActionTypes.SET_REGION_LENGTH: {
			return { ...state, regionLengthInMeters: action.payload };
		}

		case AlgorithmsActionTypes.SET_REGION: {
			return { ...state, region: action.payload };
		}

		case AlgorithmsActionTypes.ADD_TASK:
			return algorithmsAdapter.addOne(action.payload, state);

		case AlgorithmsActionTypes.DELETE_TASK:
			return algorithmsAdapter.removeOne(action.payload, state);

		case AlgorithmsActionTypes.ADD_TASKS:
			return algorithmsAdapter.addMany(action.payload, state);

		case AlgorithmsActionTypes.OPEN_MODAL:
			return { ...state, modal: { id: action.payload.caseId, show: true } };

		case AlgorithmsActionTypes.CLOSE_MODAL:
			return { ...state, modal: { id: null, show: false } };

		default:
			return state;
	}

}

export const { selectEntities, selectAll, selectTotal, selectIds } = algorithmsAdapter.getSelectors();
export const selectTaskTotal = createSelector(algorithmsStateSelector, selectTotal);
export const selectTaskEntities = <MemoizedSelector<IAlgorithmState, Dictionary<AlgorithmTaskPreview>>>createSelector(algorithmsStateSelector, selectEntities);
export const selectTasksIds = <MemoizedSelector<any, string[] | number[]>>createSelector(algorithmsStateSelector, selectIds);

export const selectAlgorithmTaskDrawIndicator: MemoizedSelector<any, any> = createSelector(algorithmsStateSelector, (algorithmsState: IAlgorithmState) => algorithmsState.drawIndicator);
export const selectAlgorithmTaskRegionLength: MemoizedSelector<any, any> = createSelector(algorithmsStateSelector, (algorithmsState: IAlgorithmState) => algorithmsState.regionLengthInMeters);
export const selectAlgorithmTaskRegion: MemoizedSelector<any, any> = createSelector(algorithmsStateSelector, (algorithmsState: IAlgorithmState) => algorithmsState.region);
export const selectAlgorithmsModal: MemoizedSelector<any, any> = createSelector(algorithmsStateSelector, (algorithmsState: IAlgorithmState) => algorithmsState.modal);
