import { OverlayReducer, IOverlayState } from '@ansyn/timeline';
import { CasesReducer, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
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

export interface IAppState {
	overlays: IOverlayState,
	cases: ICasesState
} 


//export const tmpCombineReducers = combineReducers;



//export { combineReducers } from '@ngrx/store';

/*export function AppReducers() {
	return combineReducers(reducers);
};*/
