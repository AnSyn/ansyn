import { Action } from '@ngrx/store';
import { ComboBoxesProperties } from '../models/combo-boxes.model';
import { GeoFilterStatus } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { SearchModeEnum } from '@ansyn/status-bar/models/search-mode.enum';

export const StatusBarActionsTypes = {
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SELECTED_CASE_LINK: 'COPY_SELECTED_CASE_LINK',
	EXPAND: 'EXPAND',
	SET_COMBOBOXES_PROPERTIES: 'SET_COMBOBOXES_PROPERTIES',
	UPDATE_GEO_FILTER_STATUS: 'UPDATE_GEO_FILTER_STATUS'
};

export class CopySelectedCaseLinkAction implements Action {
	type: string = StatusBarActionsTypes.COPY_SELECTED_CASE_LINK;

	constructor() {
	}
}

export class ExpandAction implements Action {
	type: string = StatusBarActionsTypes.EXPAND;

	constructor() {
	}
}


export class SetComboBoxesProperties implements Action {
	type = StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES;

	constructor(public payload: ComboBoxesProperties) {
	}
}

export class UpdateGeoFilterStatus implements Action {
	readonly type = StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS;
	constructor(public payload: Partial<GeoFilterStatus> = { searchMode: SearchModeEnum.none }) {
	}
}

export type StatusBarActions = CopySelectedCaseLinkAction | UpdateGeoFilterStatus | ExpandAction | SetComboBoxesProperties;
