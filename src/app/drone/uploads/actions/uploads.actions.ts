import { Action } from '@ngrx/store';
import { IUploadsState } from '../reducers/uploads.reducer';

export enum UploadsActionTypes {
	updateState = '[Uploads] update state'
}

export class UpdateState implements Action {
	readonly type = UploadsActionTypes.updateState;

	constructor(public payload: Partial<IUploadsState>) {

	}
}
