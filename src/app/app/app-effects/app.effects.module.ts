import { FiltersAppEffects } from './effects/filters.app.effects';
import { IFiltersState } from '@ansyn/menu-items/filters';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { LayersAppEffects } from './effects/layers.app.effects';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
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
import { RouterAppEffects } from './effects/router.app.effects';
import { CoreAppEffects } from './effects/core.app.effects';
import { ICoreState } from '@ansyn/core/reducers/core.reducer';
import { NorthAppEffects } from './effects/map/north.app.effects';


export interface IAppState {
	core: ICoreState;
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
		EffectsModule.forFeature([
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
			RouterAppEffects,
			VisualizersAppEffects,
			CoreAppEffects,
			NorthAppEffects
		])
	]
})

export class AppEffectsModule {

}
