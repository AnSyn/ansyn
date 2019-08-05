import { Action } from '@ngrx/store';

export enum PluginsActionTypes {
	SET_SCANNED_AREA = 'SET_SCANNED_AREA',
}

export class SetScannedAreaAction implements Action {
	type: string = PluginsActionTypes.SET_SCANNED_AREA;

	constructor() {
	}
}
