import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import { IOverlaysScannedArea } from '../../menu-items/cases/models/case.model';

export const PluginsActionTypes = {
	ACTIVATE_SCANNED_AREA: type('[Plugins] ACTIVATE_SCANNED_AREA'),
	SET_SCANNED_AREA: type('[Plugins] SET_SCANNED_AREA')
};

export class ActivateScannedAreaAction implements Action {
	type: string = PluginsActionTypes.ACTIVATE_SCANNED_AREA;

	constructor() {
	}
}

export class SetScannedAreaAction implements Action {
	type: string = PluginsActionTypes.SET_SCANNED_AREA;

	constructor(public payload: IOverlaysScannedArea) {
	}
}
