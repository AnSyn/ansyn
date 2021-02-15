import { Action } from '@ngrx/store';
import { IGeoFilterStatus } from '../reducers/status-bar.reducer';
import { ILogMessage } from '../../core/models/logger.model';
import { IAdvancedSearchParameter } from '../models/statusBar-config.model';
import { IOverlaysCriteria } from '../../overlays/models/overlay.model';

export const StatusBarActionsTypes = {
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SNAPSHOT_SHARE_LINK: 'COPY_SNAPSHOT_SHARE_LINK',
	EXPAND: 'EXPAND',
	UPDATE_GEO_FILTER_STATUS: 'UPDATE_GEO_FILTER_STATUS',
	GO_ADJACENT_OVERLAY: 'GO_ADJACENT_OVERLAY',
	UPDATE_CALENDER_STATUS: 'UPDATE_CALENDER_STATUS',
	TOGGLE_ADVANCED_SEARCH: 'TOGGLE_ADVANCED_SEARCH',
	TOGGLE_SIMPLE_SEARCH: 'TOGGLE_SIMPLE_SEARCH',
	OPENED_FROM_OUTSIDE: 'OPENED_FROM_OUTSIDE',
	SEARCH_ACTION: 'SEARCH_ACTION'
};

export class CopySnapshotShareLinkAction implements Action, ILogMessage {
	type: string = StatusBarActionsTypes.COPY_SNAPSHOT_SHARE_LINK;

	constructor() {
	}

	logMessage() {
		return `User selected share link option`
	}
}


export class UpdateCalendarStatusAction implements Action {
	type: string = StatusBarActionsTypes.UPDATE_CALENDER_STATUS;

	constructor(public payload: boolean) {
	}
}

export class ToggleAdvancedSearchAction implements Action {
	type: string = StatusBarActionsTypes.TOGGLE_ADVANCED_SEARCH;

	constructor(public payload: boolean) {
	}
}

export class ToggleSimpleSearchAction implements Action {
	type: string = StatusBarActionsTypes.TOGGLE_SIMPLE_SEARCH;

	constructor(public payload: boolean) {
	}
}

export class OpenAdvancedSearchFromOutsideAction implements Action {
	type: string = StatusBarActionsTypes.OPENED_FROM_OUTSIDE;

	constructor(public payload: boolean) {
	}
}

export class ExpandAction implements Action {
	type: string = StatusBarActionsTypes.EXPAND;

	constructor() {
	}
}

export class UpdateGeoFilterStatus implements Action, ILogMessage {
	readonly type = StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS;

	constructor(public payload?: Partial<IGeoFilterStatus>) {
	}

	logMessage() {
		// if payload.active is undefined, rather than false, the geotype is not deactivated
		return this.payload && this.payload.type && ( this.payload.active !== false ) && `Setting geo filter type to ${this.payload.type}`
	}
}

export class GoAdjacentOverlay implements Action {
	type: string = StatusBarActionsTypes.GO_ADJACENT_OVERLAY;

	constructor(public payload: { isNext: boolean }) {
	}
}

export class SearchAction implements Action {
	readonly type: string = StatusBarActionsTypes.SEARCH_ACTION;
	constructor(public payload: IOverlaysCriteria) {
	}
}


export type StatusBarActions =
	CopySnapshotShareLinkAction
	| UpdateGeoFilterStatus
	| ExpandAction
