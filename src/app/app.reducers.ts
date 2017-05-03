import { OverlayReducer } from '@ansyn/timeline';
import { compose } from '@ngrx/core/compose';
import { ActionReducer,combineReducers } from '@ngrx/store';

const  reducers = {    
	overlays : OverlayReducer,
	cases: CasesReducer
}

const appReducer = compose(combineReducers)(reducers);

export function reducer(state: any,action: any){ 
	return appReducer(state, action);
}


//export const tmpCombineReducers = combineReducers;



//export { combineReducers } from '@ngrx/store';

/*export function AppReducers() {
	return combineReducers(reducers);
};*/
