import { Action } from '@ngrx/store';
import { type } from '../utils/type';

export const CoreActionsTypes = {
	SET_EXPORT_MODE: type('[Core] Set Export Mode'),
}

export class SetExportModeAction implements Action {
	type = CoreActionsTypes.SET_EXPORT_MODE;

	constructor(public payload: boolean) {
	}
}
