import { Action } from '@ngrx/store';
import { IComboBoxesProperties } from '../models/combo-boxes.model';
import { IGeoFilterStatus } from '../reducers/status-bar.reducer';
import { SearchModeEnum } from '../models/search-mode.enum';

export const StatusBarActionsTypes = {
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SNAPSHOT_SHARE_LINK: 'COPY_SNAPSHOT_SHARE_LINK',
	EXPAND: 'EXPAND',
	SET_IMAGE_OPENING_ORIENTATION: 'SET_IMAGE_OPENING_ORIENTATION',
	UPDATE_GEO_FILTER_STATUS: 'UPDATE_GEO_FILTER_STATUS',
	GO_ADJACENT_OVERLAY: 'GO_ADJACENT_OVERLAY',
	GO_NEXT_PRESET_OVERLAY: 'GO_NEXT_PRESET_OVERLAY'
};

export class CopySnapshotShareLinkAction implements Action {
	type: string = StatusBarActionsTypes.COPY_SNAPSHOT_SHARE_LINK;

	constructor() {
	}
}

export class ExpandAction implements Action {
	type: string = StatusBarActionsTypes.EXPAND;

	constructor() {
	}
}


export class SetImageOpeningOrientation implements Action {
	type = StatusBarActionsTypes.SET_IMAGE_OPENING_ORIENTATION;

	constructor(public payload: IComboBoxesProperties) {
	}
}

export class UpdateGeoFilterStatus implements Action {
	readonly type = StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS;

	constructor(public payload: Partial<IGeoFilterStatus> = {active: false}) {
	}
}

export class GoAdjacentOverlay implements Action {
	type: string = StatusBarActionsTypes.GO_ADJACENT_OVERLAY;

	constructor(public payload: { isNext: boolean }) {
	}
}

export class GoNextPresetOverlay implements Action {
	type: string = StatusBarActionsTypes.GO_NEXT_PRESET_OVERLAY;

	constructor() {
	}
}

export type StatusBarActions =
	CopySnapshotShareLinkAction
	| UpdateGeoFilterStatus
	| ExpandAction
	| SetImageOpeningOrientation;
