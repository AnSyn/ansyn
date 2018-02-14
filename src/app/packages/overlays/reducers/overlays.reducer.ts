import { Overlay } from '../models/overlay.model';
import { OverlaysService } from '../services/overlays.service';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';
import { OverlaysActions, OverlaysActionTypes } from '../actions/overlays.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';

export interface TimelineState {
	from: Date;
	to: Date;
}

export interface IOverlaysState {
	loaded: boolean;
	loading: boolean;
	overlays: Map<string, Overlay>;
	selectedOverlays: string[];
	specialObjects: Map<string, OverlaySpecialObject>;
	demo: number;
	filteredOverlays: string[];
	timelineState: TimelineState;
	statusMessage: string;
}

export const overlaysInitialState: IOverlaysState = {
	loaded: false,
	loading: false,
	overlays: new Map(),
	selectedOverlays: [],
	specialObjects: new Map<string, OverlaySpecialObject>(),
	demo: 1,
	timelineState: { from: new Date(), to: new Date() },
	filteredOverlays: [],
	statusMessage: null
};
export const overlaysFeatureKey = 'overlays';
export const overlaysStateSelector: MemoizedSelector<any, IOverlaysState> = createFeatureSelector<IOverlaysState>(overlaysFeatureKey);
export const overlaysStatusMessages =  {
	noOverLayMatchQuery: "No overlays match your query, please try another search",
	overLoad : "Note: only $overLoad overlays are presented",
	noOverLayMatchFilters: "No overlays match your query, please try another search",
	nullify: null
}
export function OverlayReducer(state = overlaysInitialState, action: OverlaysActions): IOverlaysState {
	switch (action.type) {

		case OverlaysActionTypes.SELECT_OVERLAY:

			const selected = state.selectedOverlays.slice();
			if (!selected.includes(action.payload)) {
				selected.push(action.payload);
			}
			return Object.assign({}, state, {
				selectedOverlays: selected
			});

		case OverlaysActionTypes.UNSELECT_OVERLAY:
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

		case OverlaysActionTypes.LOAD_OVERLAYS:
			return {
				...state,
				loading: true,
				loaded: false,
				overlays: new Map(),
				filteredOverlays: []
			};

		case OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS:

			const overlays = OverlaysService.sort(action.payload);

			const stateOverlays = new Map(state.overlays);

			overlays.forEach(overlay => {
				if (!stateOverlays.has(overlay.id)) {
					stateOverlays.set(overlay.id, overlay);
				}
			});

			// we already initiliazing the state
			return {
				...state,
				loading: false,
				loaded: true,
				overlays: stateOverlays
			};

		case OverlaysActionTypes.LOAD_OVERLAYS_FAIL:
			return Object.assign({}, state, {
				loading: false,
				loaded: false,
			});

		case OverlaysActionTypes.SET_FILTERED_OVERLAYS:
			return { ...state, filteredOverlays: action.payload };

		case OverlaysActionTypes.SET_SPECIAL_OBJECTS:
			const specialObjectsData = OverlaysService.sort(action.payload) as any;

			const specialObjects = new Map<string, OverlaySpecialObject>();
			specialObjectsData.forEach((i: OverlaySpecialObject) => {
				specialObjects.set(i.id, i);
			});

			return { ...state, specialObjects };

		case OverlaysActionTypes.SET_TIMELINE_STATE:
			const { from, to } = action.payload.state;

			const result: number = from.getTime() - to.getTime();
			if (result > 0) {
				return state;
			}

			return {
				...state,
				timelineState: action.payload.state
			};

		case OverlaysActionTypes.SET_OVERLAYS_STATUS_MESSAGE:
			return {
				...state,
				statusMessage: action.payload
			};

		default:
			return state;
	}
}

