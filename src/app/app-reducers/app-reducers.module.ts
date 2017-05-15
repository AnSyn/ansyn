import { LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { LayersAppEffects } from './effects/layers.app.effects';
import { OverlayReducer } from '@ansyn/overlays';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { compose } from '@ngrx/core/compose';
import { combineReducers, StoreModule } from '@ngrx/store';
import { MenuReducer } from '@ansyn/menu/reducers/menu.reducer';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapAppEffects } from './effects/map.app.effects';
import { CasesAppEffects } from './effects/cases.app.effects';
import { MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { MenuAppEffects } from './effects/menu.app.effects';


const reducers = {
	overlays : OverlayReducer,
	cases: CasesReducer,
	menu: MenuReducer,
	map: MapReducer,
	layers: LayersReducer
};

const appReducer = compose(combineReducers)(reducers);

export function reducer(state: any, action: any) {
	return appReducer(state, action);
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
export class AppReducersModule {

}
