import { IOverlaysScannedArea } from '../../menu-items/cases/models/case.model';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { PluginsActionTypes } from '../actions/plugins.actions';

export const pluginsFeatureKey = 'plugins';


export interface IPluginsState {
	scannedArea: IOverlaysScannedArea;
}

export const initialPluginsState: IPluginsState = {
	scannedArea: null
};

export const pluginsStateSelector: MemoizedSelector<any, IPluginsState> = createFeatureSelector<IPluginsState>(pluginsFeatureKey);

export function PluginsReducer(state: IPluginsState = initialPluginsState, action: any ) {

	switch (action.type) {
		case PluginsActionTypes.SET_SCANNED_AREA: {
			const scannedArea = action.payload;
			return { ...state, scannedArea };
		}

		default:
			return state;
	}
}

export const selectScannedArea = createSelector(pluginsStateSelector, (tools: IPluginsState) => tools.scannedArea);
