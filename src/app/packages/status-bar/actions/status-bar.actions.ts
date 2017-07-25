import { Action } from '@ngrx/store';

export const StatusBarActionsTypes = {
	CHANGE_LAYOUT: 'CHANGE_LAYOUT',
	SHOW_LINK_COPY_TOAST: 'SHOW_LINK_COPY_TOAST',
	COPY_SELECTED_CASE_LINK: 'COPY_SELECTED_CASE_LINK',
	SET_LINK_COPY_TOAST_VALUE: 'SET_LINK_COPY_TOAST_VALUE',
	UPDATE_STATUS_FLAGS: "UPDATE_STATUS_FLAGS",
	OPEN_SHARE_LINK: 'OPEN_SHARE_LINK',

	GO_PREV: 'GO_PREV',
	GO_NEXT: 'GO_NEXT',
	BACK_TO_WORLD_VIEW: 'BACK_TO_WORLD_VIEW',
	FAVORITE: 'FAVORITE',
	EXPAND: 'EXPAND',
	TOGGLE_HISTOGRAM_STATUS_BAR: 'TOGGLE_HISTOGRAM_STATUS_BAR',
	SET_ORIENTATION: 'SET_ORIENTATION',
	SET_GEO_FILTER: 'SET_GEO_FILTER',
	SET_TIME: 'SET_TIME'

};

export type StatusActions = ChangeLayoutAction |  UpdateStatusFlagsAction;

export class ChangeLayoutAction implements Action {
	type: string = StatusBarActionsTypes.CHANGE_LAYOUT;
	constructor(public payload: number) {}
}

export class CopySelectedCaseLinkAction implements Action{
	type: string = StatusBarActionsTypes.COPY_SELECTED_CASE_LINK;
	constructor() {}
}

export class SetLinkCopyToastValueAction implements Action{
	type: string = StatusBarActionsTypes.SET_LINK_COPY_TOAST_VALUE;
	constructor(public payload: boolean) {}
}


export class UpdateStatusFlagsAction implements Action {
	type = StatusBarActionsTypes.UPDATE_STATUS_FLAGS;
	constructor(public payload: any) {
		// code...
	}
}
export class OpenShareLink implements Action{
	type: string = StatusBarActionsTypes.OPEN_SHARE_LINK;
	constructor() {}
}

export class GoPrevAction implements Action{
	type: string = StatusBarActionsTypes.GO_PREV;
	constructor() {}
}

export class GoNextAction implements Action{
	type: string = StatusBarActionsTypes.GO_NEXT;
	constructor() {}
}

export class ExpandAction implements Action{
	type: string = StatusBarActionsTypes.EXPAND;
	constructor() {}
}

export class FavoriteAction implements Action{
	type: string = StatusBarActionsTypes.FAVORITE;
	constructor() {}
}

export class BackToWorldViewAction implements Action{
	type: string = StatusBarActionsTypes.BACK_TO_WORLD_VIEW;
	constructor() {}
}

export class ToggleHistogramStatusBarAction implements Action{
	type: string = StatusBarActionsTypes.TOGGLE_HISTOGRAM_STATUS_BAR;
	constructor() {}
}

export class SetOrientationAction implements Action{
	type: string = StatusBarActionsTypes.SET_ORIENTATION;
	constructor(public payload: string) {}
}

export class SetGeoFilterAction implements Action{
	type: string = StatusBarActionsTypes.SET_GEO_FILTER;
	constructor(public payload: string) {}
}

export class SetTimeAction implements Action{
	type: string = StatusBarActionsTypes.SET_TIME;
	constructor(public payload: {from: Date, to: Date}) {}
}
