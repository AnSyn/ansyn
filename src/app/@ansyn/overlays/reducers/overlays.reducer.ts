import { Overlay } from '../models/overlay.model';
import { OverlaysService } from '../services/overlays.service';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';
import { OverlaysActions, OverlaysActionTypes } from '../actions/overlays.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as _ from 'lodash';
import { ExtendMap } from '@ansyn/overlays/reducers/extendedMap.class';

export interface TimelineRange {
	start: Date;
	end: Date;
}

export type OverlayDrop = Partial<Overlay>;

export interface OverlayDropMarkUp {
	id: string,
	markUpClassList: Array<MarkUpClass>
}

export interface MarkUpData {
	overlaysIds: Array<string>
	type?: MarkUpTypes
	data?: string
}

export enum MarkUpClass {
	active = 'active',
	hover = 'hover',
	favorites = 'favorites',
	displayed = 'displayed',
	symbole = 'symbole'

}

export enum MarkUpTypes {
	css = 'css',
	symbole = 'symbole'
}

export interface IOverlaysState {
	loaded: boolean;
	loading: boolean;
	overlays: Map<string, Overlay>;
	selectedOverlays: string[];
	specialObjects: Map<string, OverlaySpecialObject>;
	filteredOverlays: string[];
	drops: OverlayDrop[];
	timeLineRange: TimelineRange;
	statusMessage: string;
	dropsMarkUp: ExtendMap<MarkUpClass, MarkUpData>;
	hoveredOverlay: Overlay;
}

let initDropsMarkUp: ExtendMap<MarkUpClass, MarkUpData> = new ExtendMap<MarkUpClass, MarkUpData>();
Object.keys(MarkUpClass).forEach(key => {
	initDropsMarkUp.set(MarkUpClass[key], { overlaysIds: [] });
});

export const overlaysInitialState: IOverlaysState = {
	loaded: false,
	loading: false,
	overlays: new Map(),
	selectedOverlays: [],
	specialObjects: new Map<string, OverlaySpecialObject>(),
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
	overLoad: 'Note: only $overLoad overlays are presented',
	noOverLayMatchFilters: 'No overlays match your query, please try another search',
	nullify: null
};

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
			const stateOverlays = new Map(state.overlays);

			action.payload.forEach(overlay => {
				if (!stateOverlays.has(overlay.id)) {
					stateOverlays.set(overlay.id, overlay);
				}
			});
			const drops = OverlaysService.parseOverlayDataForDisplay({ ...state, overlays: stateOverlays });
			// we already initiliazing the state
			return {
				...state,
				loading: false,
				loaded: true,
				overlays: stateOverlays,
				drops
			};
		}

		case OverlaysActionTypes.LOAD_OVERLAYS_FAIL:
			return Object.assign({}, state, {
				loading: false,
				loaded: false
			});

		case OverlaysActionTypes.SET_FILTERED_OVERLAYS: {
			const drops = OverlaysService.parseOverlayDataForDisplay({ ...state, filteredOverlays: action.payload });
			return { ...state, filteredOverlays: action.payload, drops };
		}

		case OverlaysActionTypes.SET_SPECIAL_OBJECTS: {
			const specialObjects = new Map<string, OverlaySpecialObject>();
			action.payload.forEach((i: OverlaySpecialObject) => {
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

		default :
			return state;
	}

}

export const selectDrops: MemoizedSelector<IOverlaysState, OverlayDrop[]> = createSelector(overlaysStateSelector, (overlays: IOverlaysState) => overlays.drops);
export const selectOverlaysArray = createSelector(overlaysStateSelector, (overlays: IOverlaysState): Overlay[] => Array.from(overlays.overlays.values()));
export const selectOverlaysMap = createSelector(overlaysStateSelector, (overlays: IOverlaysState): Map<string, Overlay> => overlays.overlays);
export const selectFilteredOveralys = createSelector(overlaysStateSelector, (overlays: IOverlaysState): string[] => overlays.filteredOverlays);
export const selectLoading = createSelector(overlaysStateSelector, (overlays: IOverlaysState): boolean => overlays.loading);
export const selectDropMarkup = createSelector(overlaysStateSelector, (overlayState: IOverlaysState): ExtendMap<MarkUpClass, MarkUpData> => overlayState.dropsMarkUp);
