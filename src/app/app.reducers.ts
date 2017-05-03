import { TimelineReducer } from '@ansyn/timeline';
import { CasesReducer } from '@ansyn/menu-items/cases';

export const AppReducers = {
	overlays: TimelineReducer,
	cases: CasesReducer
};

//export const tmpCombineReducers = combineReducers;



//export { combineReducers } from '@ngrx/store';

/*export function AppReducers() {
	return combineReducers(reducers);
};*/
