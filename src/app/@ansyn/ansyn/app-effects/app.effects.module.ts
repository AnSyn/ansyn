import { ICasesState, IFiltersState, ILayerState, IToolsState } from '@ansyn/menu-items';
import { LayersAppEffects } from './effects/layers.app.effects';
import { IMenuState } from '@ansyn/menu';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapAppEffects } from './effects/map.app.effects';
import { CasesAppEffects } from './effects/cases.app.effects';
import { IMapState } from '@ansyn/map-facade';
import { MenuAppEffects } from './effects/menu.app.effects';
import { IStatusBarState } from '@ansyn/status-bar';
import { StatusBarAppEffects } from './effects/status-bar.app.effects';
import { IOverlaysState } from '@ansyn/overlays';
import { OverlaysAppEffects } from './effects/overlays.app.effects';
import { ToolsAppEffects } from './effects/tools.app.effects';
import { CoreAppEffects } from './effects/core.app.effects';
import { ICoreState } from '@ansyn/core';
import { UpdateCaseAppEffects } from './effects/cases/update-case.app.effects';
import { SelectCaseAppEffects } from './effects/cases/select-case.app.effects';
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
