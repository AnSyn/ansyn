import { Action } from '@ngrx/store';
import { ICaseMapPosition, ICaseMapState } from '@ansyn/core';

export enum ImageryActionType {
	POSITION_CHANGED = '[Imagery] POSITION_CHANGED',
	addAll = '[Imagery] Add all',
	changeImageryMap = '[Imagery] Change imagery map',
	changeImageryMapSuccess = '[Imagery] Change imagery map success',
	setVirtualNorth = '[Imagery] Set virtual north',
	createImagery = '[Imagery] Create imagery',
	removeImagery = '[Imagery] Remove imagery'
}

export class ChangeImageryMap implements Action {
	readonly type = ImageryActionType.changeImageryMap;

	constructor(public payload: { id: string, mapType: string, sourceType?: string, layer?: any }) {
	}
}


export class ChangeImageryMapSuccess implements Action {
	readonly type = ImageryActionType.changeImageryMapSuccess;

	constructor(public payload: { id: string, mapType: string, sourceType?: string, layer?: any }) {
	}
}

export class SetVirtualNorth implements Action {
	readonly type = ImageryActionType.setVirtualNorth;

	constructor(public payload: { id: string, virtualNorth: number }) {
	}
}

export class CreateImagery implements Action {
	readonly type = ImageryActionType.createImagery;

	constructor(public payload: { settings: ICaseMapState }) {
	}
}

export class RemoveImagery implements Action {
	readonly type = ImageryActionType.removeImagery;

	constructor(public payload: { id: string }) {
	}
}

export class PositionChangedAction implements Action {
	type = ImageryActionType.POSITION_CHANGED;

	constructor(public payload: { id: string, position: ICaseMapPosition }) {
	}
}
