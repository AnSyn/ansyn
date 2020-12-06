import { IPendingOverlay } from '@ansyn/map-facade';
import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import {
	IOverlay,
	IOverlayDrop, IOverlayError,
	IOverlaysCriteria,
	IOverlaysCriteriaOptions,
	IOverlaysHash,
	IOverlaySpecialObject,
} from '../models/overlay.model';
import { IMarkUpData, IOverlayDropMarkUp, ITimelineRange, MarkUpClass } from '../reducers/overlays.reducer';
import { Update } from '@ngrx/entity';
import { ILogMessage } from '../../core/models/logger.model';

export const OverlaysActionTypes = {
	SELECT_OVERLAY: type('[Overlay] Select Overlay'),
	SET_TOTAL_OVERLAYS: type('[Overlay] Set Selected Overlay'),
	UNSELECT_OVERLAY: type('[Overlay] Unselect Overlay'),
	LOAD_OVERLAYS: type('[Overlay] Load Overlays'),
	CHECK_TRIANGLES: type('[Overlay] Check Triangles Before Overlay Search'),
	REQUEST_OVERLAY_FROM_BACKEND: type('[Overlay] Load Overlay By Id'),
	LOAD_OVERLAYS_SUCCESS: type('[Overlay] Load Overlays Success'),
	LOAD_OVERLAYS_FAIL: type('[Overlay] Load Overlays Failed'),
	CLEAR_FILTER: type('[Overlay] Clear Filter'),
	DISPLAY_OVERLAY_FROM_STORE: type('[Overlay] Display Overlay From Store'),
	DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE: type('[Overlay] Display Multiple Overlays From Store'),
	DISPLAY_OVERLAY: type('[Overlay] Display Overlay'),
	DISPLAY_OVERLAY_SUCCESS: type('[Overlay] Display Overlay Success'),
	DISPLAY_OVERLAY_FAILED: type('[Overlay] Display Overlay Failed'),
	REDRAW_TIMELINE: type('[Overlay] Redraw Timeline'),
	ADD_OVERLAYS_MARKUPS: type('ADD_OVERLAYS_MARKUPS'),
	REMOVE_OVERLAYS_MARKUPS: type('REMOVE_OVERLAYS_MARKUPS'),
	SET_OVERLAYS_MARKUPS: type('SET_OVERLAYS_MARKUPS'),
	UPDATE_OVERLAYS_COUNT: type('UPDATE_OVERLAYS_COUNT'),
	SET_FILTERED_OVERLAYS: type('SET_FILTERED_OVERLAYS'),
	SET_TIMELINE_STATE: type('SET_TIMELINE_STATE'),
	SET_SPECIAL_OBJECTS: type('SET_SPECIAL_OBJECTS'),
	SET_DROPS: type('SET_DROPS'),
	MOUSE_OVER_DROP: type('MOUSE_OVER_DROP'),
	MOUSE_OUT_DROP: type('MOUSE_OUT_DROP'),
	SET_OVERLAYS_STATUS_MESSAGE: type('SET_OVERLAYS_STATUS_MESSAGE'),
	SET_HOVERED_OVERLAY: type('SET_HOVERED_OVERLAY'),
	CHANGE_OVERLAY_PREVIEW_ROTATION: type('[Overlay] CHANGE_OVERLAY_PREVIEW_ROTATION'),
	SET_OVERLAYS_CRITERIA: 'SET_OVERLAYS_CRITERIA',
	UPDATE_OVERLAY_COUNT: 'UPDATE_OVERLAY_COUNT',
	SET_MISC_OVERLAYS: 'SET_MISC_OVERLAYS',
	SET_MISC_OVERLAY: 'SET_MISC_OVERLAY',
	DISPLAY_FOUR_VIEW: 'DISPLAY_FOUR_VIEW',
	UPDATE_OVERLAY: 'UPDATE_OVERLAY',
	UPDATE_OVERLAYS: 'UPDATE_OVERLAYS',
	SET_OVERLAYS_CONTAINMENT_CHECKED: 'OVERLAYS_CONTAINMENT_CHECKED',
	LOG_SEARCH_PANEL_POPUP: 'LOG_SEARCH_PANEL_POPUP',
	LOG_MANUAL_SEARCH_TIME: 'LOG_MANUAL_SEARCH_TIME',
	LOG_SELECT_SEARCH_TIME_PRESET: 'LOG_SELECT_SEARCH_TIME_PRESET',
	RESET_OVERLAY_ARRAY: 'RESET_OVERLAY_ARRAY'
};

export class ResetOverlayArray implements Action {
	type = OverlaysActionTypes.RESET_OVERLAY_ARRAY;
}

export class SelectOverlayAction implements Action {
	type = OverlaysActionTypes.SELECT_OVERLAY;

	constructor(public payload: string) {
	}
}

export class SetMarkUp implements Action {
	type = OverlaysActionTypes.SET_OVERLAYS_MARKUPS;

	constructor(public payload: { classToSet: MarkUpClass, dataToSet: IMarkUpData, customOverviewElementId?: string }) {
	};
}

export class AddMarkUp implements Action {
	type = OverlaysActionTypes.ADD_OVERLAYS_MARKUPS;

	constructor(public payload: Array<IOverlayDropMarkUp>) {
	};
}

export class RemoveMarkUp implements Action {
	type = OverlaysActionTypes.REMOVE_OVERLAYS_MARKUPS;

	// array of overlay ids
	constructor(public payload: { overlayIds?: Array<string>, markupToRemove?: Array<IOverlayDropMarkUp> }) {
	};
}


export class UnSelectOverlayAction implements Action {
	type = OverlaysActionTypes.UNSELECT_OVERLAY;

	constructor(public payload: string) {
	}
}

export class LoadOverlaysAction implements Action, ILogMessage {
	type = OverlaysActionTypes.LOAD_OVERLAYS;

	constructor(public payload: IOverlaysCriteria) {
	}

	logMessage() {
		return `Start loading overlays`;
	}
}
export class DisplayFourViewAction implements Action {
	type = OverlaysActionTypes.DISPLAY_FOUR_VIEW;

	constructor(public payload?) {
	}
}

export class CheckTrianglesAction implements Action {
	type = OverlaysActionTypes.CHECK_TRIANGLES;

	constructor(public payload: IOverlaysCriteria) {
	}
}

export class RequestOverlayByIDFromBackendAction implements Action {
	type = OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND;

	constructor(public payload: { overlayId: string, sourceType: string, mapId?: string }) {
	}
}

export class LoadOverlaysSuccessAction implements Action, ILogMessage {
	type = OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS;

	constructor(public payload: IOverlay[], public clearExistingOverlays = false) {
	}

	logMessage() {
		return `Loaded ${this.payload.length} overlays`;
	}
}

export class LoadOverlaysFailAction implements Action {
	type = OverlaysActionTypes.LOAD_OVERLAYS_FAIL;

	constructor(public payload: IOverlay[]) {
	}
}

export class ClearFilterAction implements Action {
	type = OverlaysActionTypes.CLEAR_FILTER;

	constructor(public payload?: any) {
	}
}

export class DisplayOverlayFromStoreAction implements Action {
	type = OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE;

	constructor(public payload: { id: string, mapId?: string, extent?: any, customOriantation?: string }) {
	}
}

export class DisplayMultipleOverlaysFromStoreAction implements Action {
	type = OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE;

	constructor(public payload: IPendingOverlay[]) {
	}
}

export function getOverlayTitle(overlay: IOverlay): string {
	return `${overlay.sensorType} (${overlay.sensorName}) ${overlay.photoTime}`;
}

export class DisplayOverlayAction implements Action, ILogMessage {
	type = OverlaysActionTypes.DISPLAY_OVERLAY;

	constructor(public payload: {
		overlay: IOverlay, mapId: string, extent?: any, forceFirstDisplay?: boolean, force?: boolean, customOriantation?: string
	}) {
	}

	logMessage() {
		return `Start loading overlay ${getOverlayTitle(this.payload.overlay)}`
	}
}

export class DisplayOverlaySuccessAction extends DisplayOverlayAction {
	type = <any>OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS;

	logMessage() {
		return `Loaded overlay ${getOverlayTitle(this.payload.overlay)}`
	}
}

export class DisplayOverlayFailedAction implements Action, ILogMessage {
	type = OverlaysActionTypes.DISPLAY_OVERLAY_FAILED;

	constructor(public payload: { id: string, mapId?: string }) {
	}

	logMessage() {
		return `Display overlay failed`
	}
}

export class SetTotalOverlaysAction implements Action, ILogMessage {
	type = OverlaysActionTypes.SET_TOTAL_OVERLAYS;

	constructor(public payload: { number: number, showLog?: boolean }) {
	}

	logMessage() {
		return this.payload.showLog && this.payload.number > 0 && `Showing ${this.payload.number} overlays after filtering`
	}
}

export class SetFilteredOverlaysAction implements Action {
	type = OverlaysActionTypes.SET_FILTERED_OVERLAYS;

	constructor(public payload: string[]) {
	}
}

export class SetTimelineStateAction implements Action {
	type = OverlaysActionTypes.SET_TIMELINE_STATE;

	constructor(public payload: { timeLineRange: ITimelineRange }) {
	}
}

export class SetSpecialObjectsActionStore implements Action {
	type = OverlaysActionTypes.SET_SPECIAL_OBJECTS;

	constructor(public payload: Array<IOverlaySpecialObject>) {
	};
}

export class SetDropsAction implements Action {
	type = OverlaysActionTypes.SET_DROPS;

	constructor(public payload: Array<IOverlayDrop>) {
	};
}

export class SetOverlaysStatusMessageAction implements Action, ILogMessage {
	type = OverlaysActionTypes.SET_OVERLAYS_STATUS_MESSAGE;

	constructor(public payload: { message: string, originalMessages?: IOverlayError[] }) {
	}

	logMessage() {
		const originalMessages = this.payload && this.payload.originalMessages &&
			this.payload.originalMessages.reduce((prevSum, currVal) => {
				return `${prevSum}\n${currVal.sourceType ? '(' + currVal.sourceType + ') ' : ''}${currVal.message}`
			}, '');
		return this.payload && this.payload.message && `Showing overlays status message: ${this.payload.message}${this.payload.originalMessages ? originalMessages : ''}`
	}
}

export class RedrawTimelineAction implements Action {
	type = OverlaysActionTypes.REDRAW_TIMELINE;

	constructor(public payload?: string) {
	}
}

export class SetHoveredOverlayAction implements Action {
	type = OverlaysActionTypes.SET_HOVERED_OVERLAY;

	constructor(public payload?: IOverlay) {

	}
}

export class ChangeOverlayPreviewRotationAction implements Action {
	type = OverlaysActionTypes.CHANGE_OVERLAY_PREVIEW_ROTATION;

	constructor(public payload: number) {

	}
}

export class SetOverlaysCriteriaAction implements Action, ILogMessage {
	type = OverlaysActionTypes.SET_OVERLAYS_CRITERIA;

	constructor(public payload: IOverlaysCriteria,
				public options: IOverlaysCriteriaOptions = null) {
	}

	logMessage() {
		return `Setting overlays criteria for search:\n${JSON.stringify(this.payload)} ${this.options ? JSON.stringify(this.options) : ''}`
	}
}

export class UpdateOverlaysCountAction {
	type = OverlaysActionTypes.UPDATE_OVERLAY_COUNT;

	constructor(public payload: number) {
	}
}

export class SetMiscOverlays implements Action {
	type: string = OverlaysActionTypes.SET_MISC_OVERLAYS;

	constructor(public payload: { miscOverlays: IOverlaysHash }) {
	}
}

export class SetMiscOverlay implements Action {
	type: string = OverlaysActionTypes.SET_MISC_OVERLAY;

	constructor(public payload: { key: string, overlay: IOverlay }) {
	}
}

export class UpdateOverlay implements Action {
	type: string = OverlaysActionTypes.UPDATE_OVERLAY;

	constructor(public payload: Update<IOverlay>) {
	}
}

export class UpdateOverlays implements Action {
	type: string = OverlaysActionTypes.UPDATE_OVERLAYS;

	constructor(public payload: Update<IOverlay>[]) {
	}
}

export class SetOverlaysContainmentChecked implements Action {
	type: string = OverlaysActionTypes.SET_OVERLAYS_CONTAINMENT_CHECKED;

	constructor(public payload: boolean = true) {
	}
}

export class LogSearchPanelPopup implements Action, ILogMessage {
	type: string = OverlaysActionTypes.LOG_SEARCH_PANEL_POPUP;

	constructor(public payload: { popupName: string }) {
	}

	logMessage() {
		return `Search panel: opening ${this.payload.popupName} popup`
	}
}

export class LogManualSearchTime implements Action, ILogMessage {
	type: string = OverlaysActionTypes.LOG_MANUAL_SEARCH_TIME;

	constructor(public payload: { from: string, to: string }) {
	}

	logMessage() {
		return `User confirmed manual time range: ${ this.payload.from } - ${ this.payload.to }`
	}
}

export class LogSelectSearchTimePreset implements Action, ILogMessage {
	type: string = OverlaysActionTypes.LOG_SELECT_SEARCH_TIME_PRESET;

	constructor(public payload: { presetTitle: string }) {
	}

	logMessage() {
		return `User selected search time preset: ${this.payload.presetTitle}`
	}
}

export type OverlaysActions
	= DisplayOverlayFromStoreAction
	| DisplayMultipleOverlaysFromStoreAction
	| DisplayOverlayAction
	| DisplayOverlaySuccessAction
	| DisplayOverlayFailedAction
	| SelectOverlayAction
	| UnSelectOverlayAction
	| RequestOverlayByIDFromBackendAction
	| LoadOverlaysAction
	| CheckTrianglesAction
	| LoadOverlaysSuccessAction
	| LoadOverlaysFailAction
	| ClearFilterAction
	| SetFilteredOverlaysAction
	| SetOverlaysStatusMessageAction
	| AddMarkUp
	| RemoveMarkUp
	| SetHoveredOverlayAction
	| ChangeOverlayPreviewRotationAction
	| SetSpecialObjectsActionStore
	| SetDropsAction
	| SetOverlaysCriteriaAction
	| SetMiscOverlays
	| SetMiscOverlay
	| UpdateOverlay
	| UpdateOverlays
	| SetOverlaysContainmentChecked
