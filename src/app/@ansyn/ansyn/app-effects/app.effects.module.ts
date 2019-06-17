import { FiltersAppEffects } from './effects/filters.app.effects';
import { LayersAppEffects } from './effects/layers.app.effects';
import { IMenuState } from '@ansyn/menu';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapAppEffects } from './effects/map.app.effects';
import { CasesAppEffects } from './effects/cases.app.effects';
import { IMapState } from '@ansyn/map-facade';
import { MenuAppEffects } from './effects/menu.app.effects';
import { IStatusBarState } from '../modules/status-bar/reducers/status-bar.reducer';
import { StatusBarAppEffects } from './effects/status-bar.app.effects';
import { OverlaysAppEffects } from './effects/overlays.app.effects';
import { ToolsAppEffects } from './effects/tools.app.effects';
import { UpdateCaseAppEffects } from './effects/cases/update-case.app.effects';
import { SelectCaseAppEffects } from './effects/cases/select-case.app.effects';
import { ICasesState } from '../modules/menu-items/cases/reducers/cases.reducer';
import { IFiltersState } from '../modules/menu-items/filters/reducer/filters.reducer';
import { ILayerState } from '../modules/menu-items/layers-manager/reducers/layers.reducer';
import { IToolsState } from '../modules/menu-items/tools/reducers/tools.reducer';
import { IOverlaysState } from '../modules/overlays/reducers/overlays.reducer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface IAppState {
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
		TranslateModule,
		EffectsModule.forFeature([
			OverlaysAppEffects,
			MapAppEffects,
			CasesAppEffects,
			MenuAppEffects,
			LayersAppEffects,
			StatusBarAppEffects,
			FiltersAppEffects,
			ToolsAppEffects,
			UpdateCaseAppEffects,
			SelectCaseAppEffects,
		])
	]
})

export class AppEffectsModule {

}
