import { Action } from '@ngrx/store';
import { WindowLayout } from '@builder/reducers/builder.reducer';

export enum BuilderActionTypes {
	SET_WINDOW_LAYOUT = '[builder] SET_WINDOW_LAYOUT'
}

export class SetWindowLayout implements Action {
	readonly type = BuilderActionTypes.SET_WINDOW_LAYOUT;
	constructor(public payload: WindowLayout) {
	}
}
