import { FiltersAppEffects } from './effects/filters.app.effects';
import { IFiltersState } from '@ansyn/menu-items/filters';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { LayersAppEffects } from './effects/layers.app.effects';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { StoreModule } from '@ngrx/store';
import { IMenuState } from '@ansyn/menu/reducers/menu.reducer';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapAppEffects } from './effects/map.app.effects';
import { CasesAppEffects } from './effects/cases.app.effects';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { MenuAppEffects } from './effects/menu.app.effects';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarAppEffects } from './effects/status-bar.app.effects';
import { IOverlaysState } from '@ansyn/overlays/reducers/overlays.reducer';
import { IToolsState } from '@ansyn/menu-items/tools';
import { OverlaysAppEffects } from './effects/overlays.app.effects';
import { ToolsAppEffects } from './effects/tools.app.effects';
import { ContextMenuAppEffects } from './effects/map/context-menu.app.effects';
import { ContextEntityAppEffects } from './effects/context/context-entity.app.effect';
import { VisualizersAppEffects } from './effects/map/visualizers.app.effects';
import { IRouterState } from '@ansyn/router/reducers/router.reducer';
import { CasesRouterModule } from '@ansyn/cases-router/cases-router.module';
import { ToolsMapsModule } from '@ansyn/tools-map/tools-maps.module';
import { CasesMapModule } from '@ansyn/cases-map/cases-map.module';


export interface IAppState {
	overlays: IOverlaysState;
	cases: ICasesState;
	menu: IMenuState;
	layers: ILayerState;
	statusBar: IStatusBarState;
	map: IMapState;
	tools: IToolsState;
	filters: IFiltersState;
	router: IRouterState
}

@NgModule({
	imports: [
		StoreModule.forRoot({}),
		EffectsModule.forRoot([
			OverlaysAppEffects,
			MapAppEffects,
			CasesAppEffects,
			MenuAppEffects,
			LayersAppEffects,
			StatusBarAppEffects,
			FiltersAppEffects,
			ToolsAppEffects,
			ContextMenuAppEffects,
			ContextEntityAppEffects,
			VisualizersAppEffects
		]),
		CasesRouterModule,
		ToolsMapsModule,
		CasesMapModule

	],
})

export class AppReducersModule {

}
