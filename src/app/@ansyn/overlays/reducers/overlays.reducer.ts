import { IOverlay } from '@ansyn/core';
import { OverlaysService } from '../services/overlays.service';
import { IOverlaySpecialObject } from '@ansyn/core';
import { LoadOverlaysSuccessAction, OverlaysActions, OverlaysActionTypes } from '../actions/overlays.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as _ from 'lodash';
import { ExtendMap } from './extendedMap.class';
import { CoreActionTypes, SetOverlaysCriteriaAction } from '@ansyn/core';

export interface ITimelineRange {
	start: Date;
	end: Date;
}

export type OverlayDrop = Partial<IOverlay>;

export interface IOverlayDropMarkUp {
	id: string,
	markUpClassList: Array<MarkUpClass>
}

export interface IMarkUpData {
	overlaysIds: Array<string>
	type?: MarkUpTypes
	data?: string
}

export enum MarkUpClass {
	active = 'active',
	hover = 'hover',
	favorites = 'favorites',
	displayed = 'displayed',
	symbole = 'symbole',
	presets = 'presets'

}

export enum MarkUpTypes {
	css = 'css',
	symbole = 'symbole'
}

export interface IOverlaysState {
	loaded: boolean;
	loading: boolean;
	overlays: Map<string, IOverlay>;
	displayOverlayHistory: { [mapId: string]: string[] };
	selectedOverlays: string[];
	specialObjects: Map<string, IOverlaySpecialObject>;
	filteredOverlays: string[];
	drops: OverlayDrop[];
	timeLineRange: ITimelineRange;
	statusMessage: string;
	dropsMarkUp: ExtendMap<MarkUpClass, IMarkUpData>;
	hoveredOverlay: IOverlay;
}

let initDropsMarkUp: ExtendMap<MarkUpClass, IMarkUpData> = new ExtendMap<MarkUpClass, IMarkUpData>();
Object.keys(MarkUpClass).forEach(key => {
	initDropsMarkUp.set(MarkUpClass[key], { overlaysIds: [] });
});

export const overlaysInitialState: IOverlaysState = {
	loaded: false,
	loading: true,
	// "loading: true" prevents a "no overlays found" message, when starting the app with a context
	overlays: new Map(),
	displayOverlayHistory: {},
	selectedOverlays: [],
	specialObjects: new Map<string, IOverlaySpecialObject>(),
	timeLineRange: { start: new Date(), end: new Date() },
	filteredOverlays: [],
	drops: [],
	statusMessage: null,
	dropsMarkUp: initDropsMarkUp,
	hoveredOverlay: null
};

export const overlaysFeatureKey = 'overlays';
export const overlaysStateSelector: MemoizedSelector<any, IOverlaysState> = createFeatureSelector<IOverlaysState>(overlaysFeatureKey);
export const overlaysStatusMessages = {
	noOverLayMatchQuery: 'No overlays match your query, please try another search',
	overLoad: 'Query exceeds limit, only $overLoad overlays are presented',
	noOverLayMatchFilters: 'No overlays match your query, please try another search',
	nullify: null
};

export function OverlayReducer(state = overlaysInitialState, action: OverlaysActions): IOverlaysState {
	switch (action.type) {
		case CoreActionTypes.SET_OVERLAYS_CRITERIA:
			const options = (<SetOverlaysCriteriaAction> action).options;
			if (options && options.noInitialSearch) {
				return { ...state, loading: false, displayOverlayHistory: {} };
			}
			return { ...state, displayOverlayHistory: {} };
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

		case OverlaysActionTypes.LOAD_OVERLAYS: {
			const drops = OverlaysService.parseOverlayDataForDisplay({ ...state, overlays: new Map(), filteredOverlays: [] });
			return {
				...state,
				loading: true,
				loaded: false,
				overlays: new Map(),
				filteredOverlays: [],
				drops
			};
		}

		case OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS: {
			const overlays = (<LoadOverlaysSuccessAction>action).clearExistingOverlays ? new Map() : new Map(state.overlays);
			const filteredOverlays = [];
			action.payload.forEach(overlay => {
				if (!overlays.has(overlay.id)) {
					overlays.set(overlay.id, overlay);
				}
			});
			const drops = OverlaysService.parseOverlayDataForDisplay({ ...state, overlays, filteredOverlays });
			// we already initiliazing the state
			return {
				...state,
				loading: false,
				loaded: true,
				overlays,
				filteredOverlays,
				drops
			};
		}

		case OverlaysActionTypes.LOAD_OVERLAYS_FAIL:
			return Object.assign({}, state, {
				loading: false,
				loaded: false
			});

		case OverlaysActionTypes.SET_FILTERED_OVERLAYS: {
			const filteredOverlays = action.payload.filter((id) => state.overlays.get(id));
			const drops = OverlaysService.parseOverlayDataForDisplay({ ...state, filteredOverlays });
			return { ...state, filteredOverlays, drops };
		}

		case OverlaysActionTypes.SET_SPECIAL_OBJECTS: {
			const specialObjects = new Map<string, IOverlaySpecialObject>();
			action.payload.forEach((i: IOverlaySpecialObject) => {
				specialObjects.set(i.id, i);
			});
			const drops = OverlaysService.parseOverlayDataForDisplay({ ...state, specialObjects });
			return { ...state, specialObjects, drops };
		}

		case OverlaysActionTypes.SET_TIMELINE_STATE:
			const { start, end } = action.payload.timeLineRange;
			const startTime = start.getTime();
			const endTime = end.getTime();
			if (state.timeLineRange.start.getTime() !== startTime ||
				state.timeLineRange.end.getTime() !== endTime
			) {
				const result: number = startTime - endTime;
				return (result > 0) ? state : { ...state, timeLineRange: action.payload.timeLineRange };
			}
			else {
				return state;
			}

		case OverlaysActionTypes.SET_OVERLAYS_STATUS_MESSAGE:
			return {
				...state,
				statusMessage: action.payload
			};

		case OverlaysActionTypes.SET_OVERLAYS_MARKUPS:
			let dropsMarkUpCloneToSet = new ExtendMap(state.dropsMarkUp);
			dropsMarkUpCloneToSet.set(action.payload.classToSet, action.payload.dataToSet);
			return {
				...state, dropsMarkUp: dropsMarkUpCloneToSet
			};

		case OverlaysActionTypes.REMOVE_OVERLAYS_MARKUPS:
			// currently out of use
			let dropsMarkUpClone = _.clone(state.dropsMarkUp);
			if (action.payload.overlayIds) {
				action.payload.overlayIds.forEach(overlayId => {
					const markUpClassList = dropsMarkUpClone.findKeysByValue(overlayId, 'overlaysIds');
					if (markUpClassList && markUpClassList.length) {
						markUpClassList.forEach(markUpClass =>
							dropsMarkUpClone.removeValueFromMap(markUpClass, overlayId, 'overlaysIds')
						);
					}
				});
			}
			if (action.payload.markupToRemove) {
				action.payload.markupToRemove.forEach(markUpDrop => {
					markUpDrop.markUpClassList.forEach(markUpClass => {
						dropsMarkUpClone.removeValueFromMap(markUpClass, markUpDrop.id, 'overlaysIds');
					});
				});
			}

			return { ...state, dropsMarkUp: dropsMarkUpClone };


		case OverlaysActionTypes.ADD_OVERLAYS_MARKUPS:
			// currently out of use
			let dropsMarkUp = _.clone(state.dropsMarkUp);
			action.payload.forEach(dropMarkUp =>
				dropMarkUp.markUpClassList.forEach(markUpClass => {
					let markUpData = dropsMarkUp.get(markUpClass);
					markUpData.overlaysIds.push(dropMarkUp.id);
					dropsMarkUp.set(markUpClass, markUpData);
				})
			);
			return {
				...state,
				dropsMarkUp

			};

		case OverlaysActionTypes.SET_HOVERED_OVERLAY:
			return {
				...state,
				hoveredOverlay: action.payload
			};

		case OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS:
			const { mapId, overlay } = action.payload;
			const mapHistory = state.displayOverlayHistory[mapId] || [];
			return {
				...state,
				displayOverlayHistory: {
					...state.displayOverlayHistory,
					[mapId]: [...mapHistory, overlay.id]
				}
			};

		case CoreActionTypes.SET_REMOVED_OVERLAY_ID:
			if (action.payload.value) {
				const displayOverlayHistory = { ...state.displayOverlayHistory };
				Object.entries(displayOverlayHistory).forEach(([key, value]) => {
					displayOverlayHistory[key] = value.filter((id) => id !== action.payload.id);
				});
				return { ...state, displayOverlayHistory };
			}
			return state;

		case CoreActionTypes.SET_MAPS_DATA:
			const { mapsList } = action.payload;
			if (mapsList) {
				const { displayOverlayHistory } = state;
				Object.keys(displayOverlayHistory).forEach((key) => {
					if (!mapsList.some((map) => map.id === key)) {
						delete displayOverlayHistory[key];
					}
				});
				return { ...state, displayOverlayHistory };
			}
			return state;

		default :
			return state;
	}

}

export const selectDrops: MemoizedSelector<IOverlaysState, OverlayDrop[]> = createSelector(overlaysStateSelector, (overlays: IOverlaysState) => overlays.drops);
export const selectOverlaysArray = createSelector(overlaysStateSelector, (overlays: IOverlaysState): IOverlay[] => Array.from(overlays.overlays.values()));
export const selectOverlaysMap = createSelector(overlaysStateSelector, (overlays: IOverlaysState): Map<string, IOverlay> => overlays.overlays);
export const selectFilteredOveralys = createSelector(overlaysStateSelector, (overlays: IOverlaysState): string[] => overlays.filteredOverlays);
export const selectLoading = createSelector(overlaysStateSelector, (overlays: IOverlaysState): boolean => overlays.loading);
export const selectDropMarkup = createSelector(overlaysStateSelector, (overlayState: IOverlaysState): ExtendMap<MarkUpClass, IMarkUpData> => overlayState.dropsMarkUp);
export const selectHoveredOverlay = createSelector(overlaysStateSelector, (overlays: IOverlaysState): IOverlay => overlays.hoveredOverlay);
export const selectTimelineRange = createSelector(overlaysStateSelector, (overlays: IOverlaysState): ITimelineRange => overlays.timeLineRange);
export const selectdisplayOverlayHistory = createSelector(overlaysStateSelector, (overlays: IOverlaysState): { [mapId: string]: string[] } => overlays.displayOverlayHistory);
