import { MapActions, MapActionTypes } from '../actions/map.actions';
import { Position } from '@ansyn/core'
import { cloneDeep } from 'lodash';

export interface IMapState {
	positions: Position
	communicators: {},
	loadingOverlays: string[]
}

export const initialMapState: IMapState = {
	positions: {} as any,
	communicators: {},
	loadingOverlays: []
};

export function MapReducer(state: IMapState = initialMapState, action: MapActions ) {

	switch (action.type) {
		case MapActionTypes.POSITION_CHANGED:
			const positions = cloneDeep(state.positions);
			positions[action.payload.id] = action.payload.position;
			return Object.assign(state, {positions});
		case MapActionTypes.ADD_MAP_INSTANCE:
		case MapActionTypes.REMOVE_MAP_INSTACNE:
			return Object.assign({},state, {communicators: action.payload.communicatorsIds});

		case MapActionTypes.UPDATE_MAP_SIZE:
			return state;

		case MapActionTypes.SET_LOADING_OVERLAYS:
			return  {...state, loadingOverlays: action.payload};
		case MapActionTypes.ADD_OVERLAY_TO_LOADING_OVERLAYS:
			const overlayIdToAdd = action.payload.overlayId;
			const isOverlayIdToAddExists = state.loadingOverlays.find((overlay) => overlayIdToAdd ===  overlay);
			if (!isOverlayIdToAddExists) {
				const loadingOverlays = cloneDeep(state.loadingOverlays);
				loadingOverlays.push(overlayIdToAdd);
				return  {...state, loadingOverlays: loadingOverlays};
			}
			break;
		case MapActionTypes.REMOVE_OVERLAY_FROM_LOADING_OVERLAYS:
			const overlayIdToRemove = action.payload.overlayId;
			const overlayIndex = state.loadingOverlays.findIndex((overlay) => overlayIdToRemove ===  overlay);
			if (overlayIndex !== -1) {
				const loadingOverlays = cloneDeep(state.loadingOverlays);
				loadingOverlays.splice(overlayIndex, 1);
				return  {...state, loadingOverlays: loadingOverlays};
			}
			break;
		default:
			return state;
	}
}
