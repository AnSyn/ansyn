import { TimelineReducer } from '@ansyn/timeline';
import { compose } from '@ngrx/core/compose';
import { ActionReducer } from '@ngrx/store';

export const  AppReducers = {    
	overlays : TimelineReducer
}

//export const tmpCombineReducers = combineReducers; 



//export { combineReducers } from '@ngrx/store';

/*export function AppReducers() { 
	return combineReducers(reducers); 
};*/