import { OverlayReducer, IOverlayState } from '@ansyn/timeline';
import { CasesReducer, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { compose } from '@ngrx/core/compose';
import { combineReducers, StoreModule } from '@ngrx/store';
import { IMenuState, MenuReducer } from './packages/menu/reducers/menu.reducer';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { mapAppEffects } from './effects/map.effects';
import { CasesAppEffects } from './effects/cases.app.effects';


const  reducers = {
	overlays : OverlayReducer,
	cases: CasesReducer,
	menu: MenuReducer
};

export const appReducer = compose(combineReducers)(reducers);

export function reducer(state: any,action: any){
	return appReducer(state, action);
}

export interface IAppState {
	overlays: IOverlayState,
	cases: ICasesState,
	menu: IMenuState
}

@NgModule({
	imports: [
		StoreModule.provideStore(reducer),
		EffectsModule.run(mapAppEffects),
		EffectsModule.run(CasesAppEffects),
	]
})
export class AppReducer {

}
