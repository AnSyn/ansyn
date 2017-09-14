import { FiltersAppEffects } from './effects/filters.app.effects';
import { FiltersReducer, IFiltersState } from '@ansyn/menu-items/filters';
import { ILayerState, LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { LayersAppEffects } from './effects/layers.app.effects';
import { OverlayReducer } from '@ansyn/overlays';
import { CasesReducer, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { compose } from '@ngrx/core/compose';
import { combineReducers, StoreModule } from '@ngrx/store';
import { IMenuState, MenuReducer } from '@ansyn/menu/reducers/menu.reducer';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapAppEffects } from './effects/map.app.effects';
import { CasesAppEffects } from './effects/cases.app.effects';
import { IMapState, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { MenuAppEffects } from './effects/menu.app.effects';
import { IStatusBarState, StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarAppEffects } from './effects/status-bar.app.effects';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { IToolsState, ToolsReducer } from '@ansyn/menu-items/tools';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { OverlaysAppEffects } from './effects/overlays.app.effects';
import { ToolsAppEffects } from './effects/tools.app.effects';
import { ContextMenuAppEffects } from './effects/map/context-menu.app.effects';
import { ContextEntityAppEffects } from './effects/context/context-entity.app.effect';
import { VisualizersAppEffects } from './effects/map/visualizers.app.effects';
import { IRouterState, RouterReducer } from '@ansyn/router/reducers/router.reducer';
import { CasesRouterModule } from '@ansyn/cases-router/cases-router.module';
import { ToolsMapsModule } from '@ansyn/tools-map/tools-maps.module';
import { CasesMapModule } from '@ansyn/cases-map/cases-map.module';


export interface IAppState {
	overlays: IOverlayState;
	cases: ICasesState;
	menu: IMenuState;
	layers: ILayerState;
	status_bar: IStatusBarState;
	map: IMapState;
	tools: IToolsState;
	filters: IFiltersState;
	router: IRouterState
}


const reducers = {
	overlays: OverlayReducer,
	cases: CasesReducer,
	menu: MenuReducer,
	map: MapReducer,
	layers: LayersReducer,
	status_bar: StatusBarReducer,
	tools: ToolsReducer,
	filters: FiltersReducer,
	router: RouterReducer
};

const appReducer = compose(combineReducers)(reducers);

export function reducer(state: any, action: any) {
	// if(configuration.General.logActions ){
	// const date = new Date();
	// console.log(action.type,`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`);
	// }
	// console.log("action", action.type)
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
		EffectsModule.run(FiltersAppEffects),
		EffectsModule.run(ToolsAppEffects),
		EffectsModule.run(ContextMenuAppEffects),
		EffectsModule.run(ContextEntityAppEffects),
		EffectsModule.run(VisualizersAppEffects),
		CasesRouterModule,
		ToolsMapsModule,
		CasesMapModule

	],
})

export class AppReducersModule {

}
