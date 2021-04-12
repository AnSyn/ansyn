import { ICasesConfig } from './models/cases-config';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './components/cases/cases.component';
import { FormsModule } from '@angular/forms';
import { CasesModalContainerComponent } from './components/cases-modal-container/cases-modal-container.component';
import { DeleteCaseComponent } from './components/delete-case/delete-case.component';
import { CasesToolsComponent } from './components/cases-tools/cases-tools.component';
import { EffectsModule } from '@ngrx/effects';
import { CasesEffects } from './effects/cases.effects';
import { casesConfig, CasesService } from './services/cases.service';
import { SaveCaseComponent } from './components/save-case/save-case.component';
import { StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from './reducers/cases.reducer';
import { CoreModule } from '../../core/core.module';
import { MapFacadeModule } from '@ansyn/map-facade';
import { CasesContainerComponent } from './components/cases-container/cases-container.component';
import { EntitiesTableModule } from '../../entities-table/entities-table.module';

// @dynamic
@NgModule({
	imports: [
		StoreModule.forFeature(casesFeatureKey, CasesReducer),
		CommonModule,
		CoreModule,
		MapFacadeModule,
		FormsModule,
		EffectsModule.forFeature([CasesEffects]),
		EntitiesTableModule
	],
	declarations: [CasesComponent, CasesContainerComponent, CasesModalContainerComponent, DeleteCaseComponent, CasesToolsComponent, SaveCaseComponent],
	entryComponents: [CasesComponent, SaveCaseComponent, DeleteCaseComponent],
	exports: [
		CasesComponent
	],
	providers: [CasesService]
})
export class CasesModule {
	static forRoot(config: ICasesConfig): ModuleWithProviders<CasesModule> {
		return {
			ngModule: CasesModule,
			providers: [
				CasesService,
				{ provide: casesConfig, useValue: config }
			]
		};
	}

}
