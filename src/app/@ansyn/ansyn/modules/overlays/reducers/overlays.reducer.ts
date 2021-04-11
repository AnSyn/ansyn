import { MapActionTypes } from '@ansyn/map-facade';
import { createEntityAdapter, Dictionary, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as _ from 'lodash';
import { CaseRegionState, ICaseTimeState } from '../../menu-items/cases/models/case.model';
import { IAdvancedSearchParameter, IProviderData } from '../../status-bar/models/statusBar-config.model';
import {
	OverlaysActions,
	OverlaysActionTypes,
	SetMarkUp,
	SetMiscOverlay,
	SetMiscOverlays,
	SetOverlaysStatusMessageAction
} from '../actions/overlays.actions';
import {
	IFourViews,
	IOverlay,
	IOverlayDrop,
	IOverlaysCriteria,
	IOverlaysHash,
	IOverlaySpecialObject
} from '../models/overlay.model';
import { ExtendMap } from './extendedMap.class';

export interface ITimelineRange {
	start: Date;
	end: Date;
}

export interface IOverlayDropMarkUp {
	id: string,
	markUpClassList: Array<MarkUpClass>
}

export interface IOverlayDropSources {
	overlaysArray: IOverlay[];
	filteredOverlays: string[];
	specialObjects: Map<string, IOverlaySpecialObject>;
	favoriteOverlays: IOverlay[];
	showOnlyFavorites: boolean;
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

export const overlaysAdapter: EntityAdapter<IOverlay> = createEntityAdapter<IOverlay>();

export interface IOverlaysState extends EntityState<IOverlay> {
	loaded: boolean;
	loading: boolean;
	displayOverlayHistory: { [mapId: string]: string[] };
	selectedOverlays: string[];
	specialObjects: Map<string, IOverlaySpecialObject>;
	filteredOverlays: string[];
	drops: IOverlayDrop[];
	timeLineRange: ITimelineRange;
	statusMessage: string;
	dropsMarkUp: ExtendMap<MarkUpClass, IMarkUpData>;
	hoveredOverlay: IOverlay;
	overlaysCriteria: IOverlaysCriteria;
	miscOverlays: IOverlaysHash;
	customOverviewElementId: string;
	// Angular 9: Saving in the store dom element id, instead of the dom element itself,
	// because it caused the dom element to become freezed, and this caused a crash
	// in zone.js...
	totalOverlaysLength: number;
	overlaysContainmentChecked: boolean;
	runSecondSearch: boolean;
	wasFirstSearchDone: boolean;
	fourViewsOverlays: IFourViews;
}

let initDropsMarkUp: ExtendMap<MarkUpClass, IMarkUpData> = new ExtendMap<MarkUpClass, IMarkUpData>();
Object.keys(MarkUpClass).forEach(key => {
	initDropsMarkUp.set(MarkUpClass[key], { overlaysIds: [] });
});

export const overlaysInitialState: IOverlaysState = overlaysAdapter.getInitialState({
	loaded: false,
	loading: true,
	// "loading: true" prevents a "no overlays found" message, when starting the app with a context
	displayOverlayHistory: {},
	selectedOverlays: [],
	specialObjects: new Map<string, IOverlaySpecialObject>(),
	timeLineRange: { start: new Date(), end: new Date() },
	filteredOverlays: [],
	drops: [],
	statusMessage: null,
	dropsMarkUp: initDropsMarkUp,
	hoveredOverlay: null,
	overlaysCriteria: {},
	miscOverlays: {},
	customOverviewElementId: null,
	totalOverlaysLength: 0,
	overlaysContainmentChecked: false,
	runSecondSearch: true,
	wasFirstSearchDone: false,
	fourViewsOverlays: {}
});

export const overlaysFeatureKey = 'overlays';
export const overlaysStateSelector: MemoizedSelector<any, IOverlaysState> = createFeatureSelector<IOverlaysState>(overlaysFeatureKey);
export const overlaysStatusMessages = {
	noOverLayMatchQuery: 'No overlays match your query, please try another search',
	overLoad: 'Query exceeds limit, only $overLoad overlays are presented',
	noOverLayMatchFilters: 'No overlays match your query, please try another search',
	noPermissionsForArea: 'You do not have permissions to see overlays in this area',
	nullify: null
};

export function OverlayReducer(state = overlaysInitialState, action: OverlaysActions): IOverlaysState {
	switch (action.type) {
		case OverlaysActionTypes.SET_OVERLAYS_CRITERIA: {
			const overlaysCriteria = { ...state.overlaysCriteria, ...action.payload };
			const { options } = <any>action;
			let runSecondSearch = state.runSecondSearch;
			if (options && options.hasOwnProperty('runSecondSearch')) {
				runSecondSearch = options.runSecondSearch;
			}
			if (options && options.noInitialSearch) {
				return overlaysAdapter.removeAll({ ...state, loading: false, displayOverlayHistory: {}, overlaysCriteria, runSecondSearch });
			}
			return { ...state, loading: true, displayOverlayHistory: {}, overlaysCriteria, runSecondSearch };
		}
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
			} else {
				return state;
			}


		case OverlaysActionTypes.LOAD_OVERLAYS: {
			return overlaysAdapter.setAll([], {
				...state,
				loading: true,
				loaded: false,
				overlays: new Map(),
				filteredOverlays: []
			});
		}

		case OverlaysActionTypes.SET_TOTAL_OVERLAYS: {
			return { ...state, totalOverlaysLength: action.payload };
		}

		case OverlaysActionTypes.SET_FOUR_VIEWS_OVERLAYS: {
			return { ...state, fourViewsOverlays: action.payload };
		}

		case OverlaysActionTypes.CHECK_TRIANGLES: {
			return overlaysAdapter.setAll([], {
				...state,
				loading: true,
				loaded: false,
				overlaysContainmentChecked: false
			});
		}

		case OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS: {
			const newState: IOverlaysState = {
				...state,
				loading: false,
				loaded: true,
				overlaysContainmentChecked: false,
				filteredOverlays: [],
				wasFirstSearchDone: true
			};

			if (!(<any>action).clearExistingOverlays) {
				return overlaysAdapter.addMany(action.payload, newState);
			}
			return overlaysAdapter.setAll(action.payload, newState);
		}

		case OverlaysActionTypes.LOAD_OVERLAYS_FAIL:
			return Object.assign({}, state, {
				loading: false,
				loaded: false
			});

		case OverlaysActionTypes.SET_FILTERED_OVERLAYS: {
			const filteredOverlays = action.payload.filter((id) => state.entities[id]);
			return { ...state, filteredOverlays };
		}

		case OverlaysActionTypes.SET_SPECIAL_OBJECTS: {
			const specialObjects = new Map<string, IOverlaySpecialObject>();
			action.payload.forEach((i: IOverlaySpecialObject) => {
				specialObjects.set(i.id, i);
			});
			return { ...state, specialObjects };
		}

		case OverlaysActionTypes.SET_DROPS: {
			return { ...state, drops: action.payload };
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
			} else {
				return state;
			}

		case OverlaysActionTypes.SET_OVERLAYS_STATUS_MESSAGE:
			return {
				...state,
				statusMessage: action.payload && (action as SetOverlaysStatusMessageAction).payload.message,
				loading: false
			};

		case OverlaysActionTypes.SET_OVERLAYS_MARKUPS:
			let dropsMarkUpCloneToSet = new ExtendMap(state.dropsMarkUp);
			dropsMarkUpCloneToSet.set(action.payload.classToSet, action.payload.dataToSet);
			const { customOverviewElementId } = (action as unknown as SetMarkUp).payload;

			return {
				...state, dropsMarkUp: dropsMarkUpCloneToSet, customOverviewElementId
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

			return { ...state, dropsMarkUp: dropsMarkUpClone, customOverviewElementId: null };


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
			if (mapHistory.slice(-1)[0] === overlay.id) { // Is this overlay already the last item in history?
				return state;
			}
			return {
				...state,
				displayOverlayHistory: {
					...state.displayOverlayHistory,
					[mapId]: [...mapHistory, overlay.id]
				}
			};

		case MapActionTypes.SET_MAPS_DATA:
			const { mapsList } = action.payload;
			if (mapsList) {
				const displayOverlayHistory = { ...state.displayOverlayHistory };
				Object.keys(displayOverlayHistory).forEach((key) => {
					if (!mapsList.some((map) => map.id === key)) {
						delete displayOverlayHistory[key];
					}
				});
				return { ...state, displayOverlayHistory };
			}
			return state;

		case OverlaysActionTypes.SET_MISC_OVERLAYS:
			const { miscOverlays } = (<SetMiscOverlays>action).payload;
			return { ...state, miscOverlays };

		case OverlaysActionTypes.SET_MISC_OVERLAY: {
			const { key, overlay } = (<SetMiscOverlay>action).payload;
			return {
				...state, miscOverlays: {
					...state.miscOverlays,
					[key]: overlay
				}
			};
		}

		case OverlaysActionTypes.SET_OVERLAYS_CONTAINMENT_CHECKED:
			return { ...state, overlaysContainmentChecked: action.payload };

		case OverlaysActionTypes.UPDATE_OVERLAY: {
			return overlaysAdapter.updateOne(action.payload, state);
		}

		case OverlaysActionTypes.UPDATE_OVERLAYS: {
			return overlaysAdapter.updateMany(action.payload, state);
		}

		default :
			return state;
	}

}

export const { selectEntities, selectAll, selectTotal, selectIds } = overlaysAdapter.getSelectors();

export const selectOverlays = createSelector(overlaysStateSelector, selectEntities);
export const selectOverlaysMap: any = createSelector(selectOverlays, (entities: Dictionary<IOverlay>): Map<string, IOverlay> => new Map(Object.entries(entities)));
export const selectOverlaysArray = createSelector(overlaysStateSelector, selectAll);
export const selectOverlaysIds = createSelector(overlaysStateSelector, selectIds);
export const selectFilteredOverlays = createSelector(overlaysStateSelector, (overlays: IOverlaysState): string[] => overlays && overlays.filteredOverlays);
export const selectSpecialObjects = createSelector(overlaysStateSelector, (overlays: IOverlaysState): Map<string, IOverlaySpecialObject> => overlays.specialObjects);
export const selectDrops = createSelector(overlaysStateSelector, (overlays: IOverlaysState) => overlays && overlays.drops);
export const selectFourViewsOverlays = createSelector(overlaysStateSelector, (overlays: IOverlaysState) => overlays?.fourViewsOverlays);
export const selectDropsWithoutSpecialObjects = createSelector(selectDrops, (drops: IOverlayDrop[]) => drops && drops.filter(({ shape }) => !shape));
export const selectDropsDescending = createSelector(selectDrops, (drops: IOverlayDrop[]) => drops && drops.filter(({ shape }) => !shape).reverse());
export const selectDropsAscending = createSelector(selectDrops, (drops: IOverlayDrop[]) => drops && drops.filter(({ shape }) => !shape));
export const selectLoading = createSelector(overlaysStateSelector, (overlays: IOverlaysState): boolean => overlays.loading);
export const selectDropMarkup = createSelector(overlaysStateSelector, (overlayState: IOverlaysState): ExtendMap<MarkUpClass, IMarkUpData> => overlayState.dropsMarkUp);
export const selectHoveredOverlay = createSelector(overlaysStateSelector, (overlays: IOverlaysState): IOverlay => overlays.hoveredOverlay);
export const selectIsRunSecondSearch = createSelector(overlaysStateSelector, (overlays: IOverlaysState): boolean => overlays?.runSecondSearch);
export const selectIsFirstSearchRun = createSelector(overlaysStateSelector, (overlays: IOverlaysState): boolean => overlays?.wasFirstSearchDone);

export const selectTimelineRange = createSelector(overlaysStateSelector, (overlays: IOverlaysState): ITimelineRange => overlays.timeLineRange);
export const selectdisplayOverlayHistory = createSelector(overlaysStateSelector, (overlays: IOverlaysState): { [mapId: string]: string[] } => overlays.displayOverlayHistory);
export const selectStatusMessage = createSelector(overlaysStateSelector, (overlays: IOverlaysState): string => overlays.statusMessage);
export const selectOverlaysCriteria: MemoizedSelector<any, IOverlaysCriteria> = createSelector(overlaysStateSelector, (overlays) => overlays && overlays.overlaysCriteria);
export const selectAdvancedSearchParameters: MemoizedSelector<any, IAdvancedSearchParameter> = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria?.advancedSearchParameters);
export const selectProviders: MemoizedSelector<any, IProviderData[]> = createSelector(selectAdvancedSearchParameters, (advancedSearchParameters) => advancedSearchParameters && advancedSearchParameters.providers);
export const selectRegion: MemoizedSelector<any, CaseRegionState> = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria && overlayCriteria.region);
export const selectTime: MemoizedSelector<any, ICaseTimeState> = createSelector(selectOverlaysCriteria, (overlayCriteria) => overlayCriteria && overlayCriteria.time);

export const selectMiscOverlays: MemoizedSelector<any, any> = createSelector(overlaysStateSelector, (overlays: IOverlaysState) => overlays ? overlays.miscOverlays : {});
export const selectMiscOverlay = (key: string) => createSelector(selectMiscOverlays, (miscOverlays: any) => miscOverlays[key]);
export const selectCustomOverviewElementId = createSelector(overlaysStateSelector, (state) => state && state.customOverviewElementId);
export const selectOverlaysAreLoaded: MemoizedSelector<any, boolean> = createSelector(overlaysStateSelector, (state) => state?.loaded);
export const selectOverlaysContainmentChecked: MemoizedSelector<any, boolean> = createSelector(overlaysStateSelector, (state) => state?.overlaysContainmentChecked);
