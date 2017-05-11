/**
 * Created by ohad1 on 02/04/2017.
 */
import * as overlay from '../actions/overlays.actions';
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

export const overlayInitialState: IOverlayState = {
	loaded: false,
	loading: false,
	overlays: new Map(),
	selectedOverlays: [],
	demo: 1,
	//@todo change to Map
	filters: {}
}

export function OverlayReducer(state = overlayInitialState,action: overlay.OverlaysActions): IOverlayState {
	switch(action.type){
		case overlay.OverlaysActionTypes.DEMO:
			let demo = ++state.demo;
			let tmp:IOverlayState = Object.assign({}, state, {
            	demo
            });

			return tmp;

		case overlay.OverlaysActionTypes.SELECT_OVERLAY:

			const selected = state.selectedOverlays.slice();
			if(selected.indexOf(action.payload) === -1){
				selected.push(action.payload);
			}
			return Object.assign({},state,{
				selectedOverlays: selected
			});


		case overlay.OverlaysActionTypes.UNSELECT_OVERLAY:
			const selected1 = state.selectedOverlays.slice();
			const index = selected1.indexOf(action.payload);
			if( index > -1){
				selected1.splice(index,1);
				return Object.assign({},state,{
					selectedOverlays: selected1
				});
			}
			else{
				return state;
			}

		case overlay.OverlaysActionTypes.LOAD_OVERLAYS:
				const filters = action.payload;
				return Object.assign({},state,{
					loading: true,
					filters
				});

		case overlay.OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS:
				
				const overlays = action.payload;

				const stateOverlays = new Map(state.overlays);

				overlays.forEach(overlay => {
					if(!stateOverlays.has(overlay.id)){
						stateOverlays.set(overlay.id,overlay);
					}
				});

				//we already initiliazing the state
				return Object.assign({},state,{
               		loading: false,
               		loaded: true,
               		overlays: stateOverlays
				});


		case overlay.OverlaysActionTypes.LOAD_OVERLAYS_FAIL:
				return Object.assign({},state,{
					loading: false
				});


		default: return state;
	}
}

