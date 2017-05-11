import { Action } from '@ngrx/store';
import { IPosition } from '../../imagery/model/model';

export const MapActionTypes = {
	POSITION_CHANGED: 'POSITION_CHANGED',
	UPDATE_MAP_SIZE: 'UPDATE_MAP_SIZE'
};

export type MapActions = any;

export class PositionChangedAction implements Action{
	type = MapActionTypes.POSITION_CHANGED;
	constructor	(public payload: IPosition) {}
}
export class UpdateMapSizeAction implements Action{
	type = MapActionTypes.UPDATE_MAP_SIZE;
	constructor	(public payload?: any) {}
}
