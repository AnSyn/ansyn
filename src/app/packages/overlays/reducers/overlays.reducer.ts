/**
 * Created by ohad1 on 02/04/2017.
 */
import * as overlay from '../actions/overlays.actions';
import { Overlay } from '../models/overlay.model';
import { OverlaysService } from '../services/overlays.service';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';


export interface IOverlayState {
	loaded: boolean;
	loading: boolean;
	overlays: any; // Map
	selectedOverlays: string[];
	specialObjects: Map<string, OverlaySpecialObject>;
	demo: number;
	filters: any[];
	filteredOverlays: string[];
	queryParams: any;
	timelineState: { from: Date, to: Date };
	count: number;
}

export const overlayInitialState: IOverlayState = {
	loaded: false,
	loading: false,
	overlays: new Map(),
	selectedOverlays: [],
	specialObjects: new Map<string, OverlaySpecialObject>(),
	demo: 1,
	// @TODO change to Map
	filters: [],
	queryParams: {},
	timelineState: { from: new Date(), to: new Date() },
	filteredOverlays: [],
	count: 0
};

export function OverlayReducer(state = overlayInitialState, action: overlay.OverlaysActions): IOverlayState {
	switch (action.type) {

		case overlay.OverlaysActionTypes.UPDATE_OVERLAYS_COUNT:
			return { ...state, count: action.payload };

		case overlay.OverlaysActionTypes.SELECT_OVERLAY:

			const selected = state.selectedOverlays.slice();
			if (!selected.includes(action.payload)) {
				selected.push(action.payload);
			}
			return Object.assign({}, state, {
				selectedOverlays: selected
			});

		case overlay.OverlaysActionTypes.UNSELECT_OVERLAY:
			const selected1 = state.selectedOverlays.slice();
			const index = selected1.indexOf(action.payload);
			if (index > -1) {
				selected1.splice(index, 1);
				return Object.assign({}, state, {
					selectedOverlays: selected1
				});
			}
			else {
				return state;
			}

		case overlay.OverlaysActionTypes.LOAD_OVERLAYS:
			const queryParams = action.payload || {};
			return Object.assign({}, state, {
				loading: true,
				queryParams,
				overlays: new Map(),
				filters: [],
				filteredOverlays: []
			});

		case overlay.OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS:

			const overlays = OverlaysService.sort(action.payload);

			const stateOverlays = new Map(state.overlays);

			overlays.forEach(overlay => {
				if (!stateOverlays.has(overlay.id)) {
					stateOverlays.set(overlay.id, overlay);
				}
			});

			// we already initiliazing the state
			return Object.assign({}, state, {
				loading: false,
				loaded: true,
				overlays: stateOverlays,
				count: 0
			});

		case overlay.OverlaysActionTypes.LOAD_OVERLAYS_FAIL:
			return Object.assign({}, state, {
				loading: false
			});

		case overlay.OverlaysActionTypes.SET_FILTERS:
			let overlaysToFilter = state.overlays;

			if (action.payload.showOnlyFavorites) {
				overlaysToFilter = new Map<string, Overlay>();

				action.payload.favorites.forEach(id => {
					overlaysToFilter.set(id, state.overlays.get(id));
				});
			}

			const res = OverlaysService.filter(overlaysToFilter, action.payload.parsedFilters);

			return {
				...state,
				filters: action.payload.parsedFilters,
				filteredOverlays: res
			};

		case overlay.OverlaysActionTypes.SET_SPECIAL_OBJECTS :
			const specialObjectsData = OverlaysService.sort(action.payload) as any;

			const specialObjects = new Map<string, OverlaySpecialObject>();
			specialObjectsData.forEach((i: OverlaySpecialObject) => {
				specialObjects.set(i.id, i);
			});

			return { ...state, specialObjects };

		case overlay.OverlaysActionTypes.SET_TIMELINE_STATE:
			const { from, to } = action.payload as { to: Date, from: Date };

			const result: number = from.getTime() - to.getTime();
			if (result > 0) {
				return state;
			}

			return Object.assign({}, state, {
				timelineState: action.payload
			});

		default:
			return state;
	}
}

