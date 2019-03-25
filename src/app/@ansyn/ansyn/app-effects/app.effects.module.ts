import { FiltersAppEffects } from './effects/filters.app.effects';
import { ICasesState, IFiltersState, ILayerState, IToolsState } from '../modules/menu-items/public_api';
import { LayersAppEffects } from './effects/layers.app.effects';
import { IMenuState } from '@ansyn/menu';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapAppEffects } from './effects/map.app.effects';
import { CasesAppEffects } from './effects/cases.app.effects';
import { IMapState } from '@ansyn/map-facade';
import { MenuAppEffects } from './effects/menu.app.effects';
import { IStatusBarState } from '../modules/status-bar/public_api';
import { StatusBarAppEffects } from './effects/status-bar.app.effects';
import { IOverlaysState } from '../modules/overlays/public_api';
import { OverlaysAppEffects } from './effects/overlays.app.effects';
import { ToolsAppEffects } from './effects/tools.app.effects';
import { CoreAppEffects } from './effects/core.app.effects';
import { ICoreState } from '@ansyn/core';
import { UpdateCaseAppEffects } from './effects/cases/update-case.app.effects';
import { SelectCaseAppEffects } from './effects/cases/select-case.app.effects';

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
		])
	]
})

export class AppEffectsModule {

}
