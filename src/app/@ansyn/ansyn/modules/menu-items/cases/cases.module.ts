import { ICasesConfig } from './models/cases-config';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './components/cases/cases.component';
import { CasesTableComponent } from './components/cases-table/cases-table.component';
import { EditCaseComponent } from './components/edit-case/edit-case.component';
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
import { CasesAutoSaveComponent } from './components/cases-auto-save/cases-auto-save.component';
import { CoreModule } from '../../core/core.module';
import { MapFacadeModule } from '@ansyn/map-facade';

// @dynamic
@NgModule({
	imports: [
		StoreModule.forFeature(casesFeatureKey, CasesReducer),
		CommonModule,
		CoreModule,
		MapFacadeModule,
		FormsModule,
		EffectsModule.forFeature([CasesEffects])
	],
	declarations: [CasesComponent, CasesTableComponent, EditCaseComponent, CasesModalContainerComponent, DeleteCaseComponent, CasesToolsComponent, SaveCaseComponent, CasesAutoSaveComponent],
	entryComponents: [CasesComponent, EditCaseComponent, SaveCaseComponent, DeleteCaseComponent],
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
