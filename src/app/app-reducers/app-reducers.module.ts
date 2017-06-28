import { FiltersAppEffects } from './effects/filters.app.effects';
import { IFiltersState, FiltersReducer } from '@ansyn/menu-items/filters';
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
import { IToolsState,ToolsReducer } from '@ansyn/menu-items/tools';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { RouterAppEffects } from './effects/router.app.effects';
import { routerReducer, RouterState, RouterStoreModule } from '@ngrx/router-store';
import { RouterStoreHelperService } from './services/router-store-helper.service';
import { configuration } from './../../configuration/configuration';
import { OverlaysAppEffects } from './effects/overlays.app.effects';

export interface IAppState {
    overlays: IOverlayState;
    cases: ICasesState;
    menu: IMenuState;
    layers: ILayerState;
    status_bar: IStatusBarState;
    map: IMapState;
    tools: IToolsState;
    router: RouterState;
    filters: IFiltersState;
}


const reducers = {
    overlays: OverlayReducer,
    cases: CasesReducer,
    menu: MenuReducer,
    map: MapReducer,
    layers: LayersReducer,
    status_bar: StatusBarReducer,
    tools: ToolsReducer,
	router: routerReducer,
    filters: FiltersReducer
};

const appReducer = compose(combineReducers)(reducers);

export function reducer(state: any, action: any) {
    if(configuration.General.logActions){
    	console.log(action.type);
	}
    return appReducer(state, action);
}

@NgModule({
    imports: [
        StoreModule.provideStore(reducer),
		StoreDevtoolsModule.instrumentOnlyWithExtension({
			maxAge: 5
		}),
		EffectsModule.run(OverlaysAppEffects),
        EffectsModule.run(MapAppEffects),
        EffectsModule.run(CasesAppEffects),
        EffectsModule.run(MenuAppEffects),
        EffectsModule.run(LayersAppEffects),
        EffectsModule.run(StatusBarAppEffects),
		EffectsModule.run(RouterAppEffects),
        EffectsModule.run(FiltersAppEffects),
		RouterStoreModule.connectRouter()
    ],
	providers:[RouterStoreHelperService]
})

export class AppReducersModule {

}
