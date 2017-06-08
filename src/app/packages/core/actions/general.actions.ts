import { Action } from '@ngrx/store';

export const GeneralActionTypes = {
    EMPTY_ACTION: 'EMPTY_ACTION'
};

export class EmptyAction implements Action {
	type = GeneralActionTypes.EMPTY_ACTION;
	constructor(){}
}
