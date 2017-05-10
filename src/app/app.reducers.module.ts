import { ILayerState, LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { LayersAppEffects } from './effects/layers.app.effects';
import { OverlayReducer, IOverlayState } from '@ansyn/overlays';
import { CasesReducer, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { compose } from '@ngrx/core/compose';
import { combineReducers, StoreModule } from '@ngrx/store';
import { IMenuState, MenuReducer } from './packages/menu/reducers/menu.reducer';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapAppEffects } from './effects/map.app.effects';
import { CasesAppEffects } from './effects/cases.app.effects';
import { MapReducer } from './packages/map-facade/reducers/map.reducer';
import { MenuAppEffects } from './effects/menu.app.effects';


const  reducers = {
	overlays : OverlayReducer,
	cases: CasesReducer,
	menu: MenuReducer,
	map: MapReducer,
	layers: LayersReducer
};

export const appReducer = compose(combineReducers)(reducers);

export function reducer(state: any, action: any) {
	return appReducer(state, action);
}

export interface IAppState {
	overlays: IOverlayState;
	cases: ICasesState;
	menu: IMenuState;
	layers: ILayerState;
}

@NgModule({
	imports: [
		StoreModule.provideStore(reducer),
		EffectsModule.run(MapAppEffects),
		EffectsModule.run(CasesAppEffects),
		EffectsModule.run(MenuAppEffects),
		EffectsModule.run(LayersAppEffects)
	]
})
export class AppReducer {

}
