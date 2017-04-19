import { TimelineReducer } from '@ansyn/timeline';
import { combineReducers,ActionReducer } from '@ngrx/store';

const reducers = {    
	overlays : TimelineReducer
}

export const AppReducers = combineReducers(reducers);