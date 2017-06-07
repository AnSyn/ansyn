import { Action } from '@ngrx/store';
import { Position } from '@ansyn/core';

export const MapActionTypes = {
	POSITION_CHANGED: 'POSITION_CHANGED',
	UPDATE_MAP_SIZE: 'UPDATE_MAP_SIZE',
	COMMUNICATORS_CHANGE: 'COMMUNICATORS_CHANGE',
	STOP_MAP_SHADOW_ACTIONS: 'STOP_MAP_SHADOW_ACTIONS',
	START_MAP_SHADOW_ACTIONS: 'START_MAP_SHADOW_ACTIONS'
};

export type MapActions = any;

export class PositionChangedAction implements Action{
	type = MapActionTypes.POSITION_CHANGED;
	constructor	(public payload: {id: string, position: Position}) {}
}

export class UpdateMapSizeAction implements Action{
	type = MapActionTypes.UPDATE_MAP_SIZE;
	constructor	(public payload?: any) {}
}

export class CommuincatorsChangeAction implements Action{
	type = MapActionTypes.COMMUNICATORS_CHANGE;
	constructor(public payload: {}) {}
}

export class StopMapShadowAction implements Action{
	type = MapActionTypes.STOP_MAP_SHADOW_ACTIONS;
	constructor	(public payload?: any) {
		console.log('stopmapshadowaction constructor');
	}
}

export class StartMapShadowAction implements Action{
	type = MapActionTypes.START_MAP_SHADOW_ACTIONS;
	constructor(public payload?: any) {}
}
