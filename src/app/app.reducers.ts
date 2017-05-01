import { TimelineReducer } from '@ansyn/timeline';
import { casesReducer } from '@ansyn/menu-items/cases';

export const AppReducers = {
	overlays: TimelineReducer,
	cases: casesReducer
};

//export const tmpCombineReducers = combineReducers;



//export { combineReducers } from '@ngrx/store';

/*export function AppReducers() {
	return combineReducers(reducers);
};*/
