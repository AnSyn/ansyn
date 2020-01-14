import { createAction, props } from '@ngrx/store';
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

export const CopySnapshotShareLinkAction = createAction(
											StatusBarActionsTypes.COPY_SNAPSHOT_SHARE_LINK
);

export const ExpandAction = createAction(
								StatusBarActionsTypes.EXPAND
);

export const SetImageOpeningOrientation = createAction(
											StatusBarActionsTypes.SET_IMAGE_OPENING_ORIENTATION,
											props<IComboBoxesProperties>()
											);

export const UpdateGeoFilterStatus = createAction(
										StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS,
										(status: Partial<IGeoFilterStatus> = { searchMode: SearchModeEnum.none }) => (status)
										// props<Partial<IGeoFilterStatus>>() // = { searchMode: SearchModeEnum.none }
);

export const GoAdjacentOverlay = createAction(
									StatusBarActionsTypes.GO_ADJACENT_OVERLAY,
									props<{ isNext: boolean }>()
);

export const GoNextPresetOverlay = createAction(
									StatusBarActionsTypes.GO_NEXT_PRESET_OVERLAY
);

export type StatusBarActions =
	CopySnapshotShareLinkAction
	| UpdateGeoFilterStatus
	| ExpandAction
	| SetImageOpeningOrientation;
