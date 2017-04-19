/**
 * Created by ohad1 on 02/04/2017.
 */
import * as overlay from '../actions/timeline.actions';
import { Overlay } from "../models/overlay.model";
import { createSelector } from 'reselect';

export interface State {
	loaded: boolean;
	loading: boolean;
	ids: string[];
	overlays: { [id: string]: Overlay};
	selectedOverlays: string[];
	demo: number;

}

export const initialState: State = {
	loaded: false,
	loading: false,
	ids: [],
	overlays: {},
	selectedOverlays: [],
	demo: 1
}

export function reducer(state = initialState,action: overlay.Actions): State {
	switch(action.type){
		case overlay.ActionTypes.DEMO:
			let demo = state.demo++;
			return Object.assign({}, state, {    
            	demo:demo
            });
			//break;
		case overlay.ActionTypes.SELECT_OVERLAY:
			break;

		case overlay.ActionTypes.UNSELECT_OVERLAY:
			break;

		case overlay.ActionTypes.LOAD_OVERLAYS:
				return Object.assign({},state,{
					loading: true
				});

		case overlay.ActionTypes.LOAD_OVERLAYS_SUCCESS:
				const overlays = action.payload;
				const newIds = [];
				const newOverlays = {};
				overlays.forEach(overlay => {
					if(state.overlays[overlay.id] !== undefined){
						newIds.push(overlay.id);
						newOverlays[overlay.id] = Object.assign({},overlay);
					}
				});
				return;


		case overlay.ActionTypes.LOAD_OVERLAYS_FAIL:
				return Object.assign({},state,{
					loading: false
				});


		default: return state;
	}
}

