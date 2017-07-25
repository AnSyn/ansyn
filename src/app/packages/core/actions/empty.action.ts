import { Action } from '@ngrx/store';

export const EMPTY_ACTION = "EMPTY_ACTION";

export class EmptyAction implements  Action{
	type: "EMPTY_ACTION";
	constructor(payload?:any){}
}
