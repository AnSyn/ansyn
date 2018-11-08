import { IAlgorithmState } from './algorithms.reducer';
import { AlgorithmsActions, AlgorithmsActionTypes } from '../actions/algorithms.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary, EntitySelectors } from '@ngrx/entity/src/models';
import { IAlgorithm } from '../models/algorithms.model';
import { GeometryObject } from 'geojson';

export const algorithmsAdapter: EntityAdapter<IAlgorithm> = createEntityAdapter<IAlgorithm>();

export interface IAlgorithmState extends EntityState<IAlgorithm> {
	drawIndicator: boolean;
	region: GeometryObject;
}

export const initialAlgorithmsState: IAlgorithmState = algorithmsAdapter.getInitialState({
	drawIndicator: false,
	region: null
});

export const algorithmsFeatureKey = 'algorithms';
export const algorithmsStateSelector: MemoizedSelector<any, IAlgorithmState> = createFeatureSelector<IAlgorithmState>(algorithmsFeatureKey);

export function AlgorithmsReducer(state: IAlgorithmState = initialAlgorithmsState, action: AlgorithmsActions | any): IAlgorithmState {
	switch (action.type) {

		case AlgorithmsActionTypes.SET_DRAW_INDICATOR: {
			return { ...state, drawIndicator: action.payload };
		}

		case AlgorithmsActionTypes.SET_REGION: {
			return { ...state, region: action.payload };
		}

		default:
			return state;
	}

}

export const { selectAll, selectEntities }: EntitySelectors<IAlgorithm, IAlgorithmState> = algorithmsAdapter.getSelectors();
export const algorithmsStateOrInitial: MemoizedSelector<any, any> = createSelector(algorithmsStateSelector, (algorithmsState: IAlgorithmState) => algorithmsState || initialAlgorithmsState);
export const selectAlgorithms: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, selectAll);
export const selectAlgorithmsEntities: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, <(state: any) => Dictionary<any>>selectEntities);

export const selectAlgorithmTaskDrawIndicator: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, (algorithmsState: IAlgorithmState) => algorithmsState.drawIndicator);
export const selectAlgorithmTaskRegion: MemoizedSelector<any, any> = createSelector(algorithmsStateOrInitial, (algorithmsState: IAlgorithmState) => algorithmsState.region);
