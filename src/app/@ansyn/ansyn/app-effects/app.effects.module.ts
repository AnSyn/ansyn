import { FiltersAppEffects } from './effects/filters.app.effects';
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
import { OverlaysAppEffects } from './effects/overlays.app.effects';
import { ToolsAppEffects } from './effects/tools.app.effects';
import { CoreAppEffects } from './effects/core.app.effects';
import { ICoreState } from '@ansyn/core';
import { UpdateCaseAppEffects } from './effects/cases/update-case.app.effects';
import { SelectCaseAppEffects } from './effects/cases/select-case.app.effects';
import { IToolsState } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { ContextAppEffects } from './effects/context.app.effects';

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
	router: any
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
			CoreAppEffects,
			UpdateCaseAppEffects,
			SelectCaseAppEffects,
			ContextAppEffects
		])
	]
})

export class AppEffectsModule {

}
