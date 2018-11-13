import { IAlgorithmState } from './algorithms.reducer';
import { AlgorithmsActions, AlgorithmsActionTypes } from '../actions/algorithms.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { AlgorithmTask } from '../models/algorithms.model';
import { GeometryObject } from 'geojson';

// export const algorithmsAdapter: EntityAdapter<IAlgorithmState> = createEntityAdapter<IAlgorithmState>();

export interface ITaskModal {
	show: boolean,
	id?: string
}

export interface IAlgorithmState {
	drawIndicator: boolean;
	regionLengthInMeters: number;
	region: GeometryObject;
	selectedTask: AlgorithmTask;
	modal: ITaskModal;
}

export const initialAlgorithmsState: IAlgorithmState = {
	drawIndicator: false,
	regionLengthInMeters: 1000,
	region: null,
	selectedTask: null,
	modal: { show: false }
};

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

		default:
			return state;
	}

}

export const algorithmsStateOrInitial: MemoizedSelector<any, any> = createSelector(algorithmsStateSelector, (algorithmsState: IAlgorithmState) => algorithmsState || initialAlgorithmsState);
export const selectAlgorithmTaskDrawIndicator: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, (algorithmsState: IAlgorithmState) => algorithmsState.drawIndicator);
export const selectAlgorithmTaskRegionLength: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, (algorithmsState: IAlgorithmState) => algorithmsState.regionLengthInMeters);
export const selectAlgorithmTaskRegion: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, (algorithmsState: IAlgorithmState) => algorithmsState.region);
export const selectAlgorithmsModal: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, (algorithmsState: IAlgorithmState) => algorithmsState.modal);
