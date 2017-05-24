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
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarAppEffects } from './effects/status-bar.app.effects';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IMenuState } from '@ansyn/menu/reducers/menu.reducer';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';

export interface IAppState {
	overlays: IOverlayState;
	cases: ICasesState;
	menu: IMenuState;
	layers: ILayerState;
	status_bar: IStatusBarState,
	map: IMapState,
}


const reducers = {
	overlays : OverlayReducer,
	cases: CasesReducer,
	menu: MenuReducer,
	map: MapReducer,
	layers: LayersReducer,
	status_bar: StatusBarReducer
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
		EffectsModule.run(LayersAppEffects),
		EffectsModule.run(StatusBarAppEffects)

	]
})
export class AppReducersModule {

}
