/**
 * Created by ohad1 on 02/04/2017.
 */
import * as overlay from '../actions/timeline.actions';
import { Overlay } from "../models/overlay.model";
import { createSelector } from 'reselect';

export interface IOverlayState {
	loaded: boolean;
	loading: boolean;
	overlays: any; //Map
	selectedOverlays: string[];
	demo: number;
	filters : any;
}

export const initialState: IOverlayState = {
	loaded: false,
	loading: false,
	overlays: new Map(),
	selectedOverlays: [],
	demo: 1,
	//@todo change to Map
	filters: {}
}

export function reducer(state = initialState,action: overlay.OverlaysActions): IOverlayState {
	switch(action.type){
		case overlay.ActionTypes.DEMO:
			
			let demo = ++state.demo;
			let tmp:IOverlayState = Object.assign({}, state, {    
            	demo
            });
			return tmp;

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
				
				overlays.forEach(overlay => {
					if(!state.overlays.has(overlay.id)){
						state.overlays.set(overlay.id,overlay);
					}
				});
				//we already initiliazing the state 
				return Object.assign({},state,{    
               		loading: false,
               		loaded: true
               	});


		case overlay.ActionTypes.LOAD_OVERLAYS_FAIL:
				return Object.assign({},state,{
					loading: false
				});


		default: return state;
	}
}

