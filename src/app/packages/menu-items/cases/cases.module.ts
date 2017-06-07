import { CasesConfig } from './models/cases-config';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './components/cases/cases.component';
import { CoreModule, MenuItem, AddMenuItemAction } from "@ansyn/core";
import { InfiniteScrollModule } from "@ansyn/utils";
import { CasesTableComponent } from './components/cases-table/cases-table.component';
import { EditCaseComponent } from "./components/edit-case/edit-case.component";
import { FormsModule } from "@angular/forms";
import { CasesModalContainerComponent } from './components/cases-modal-container/cases-modal-container.component';
import { DeleteCaseComponent } from './components/delete-case/delete-case.component';
import { CasesToolsComponent } from './components/cases-tools/cases-tools.component';
import { EffectsModule } from '@ngrx/effects';
import { CasesEffects } from './effects/cases.effects';
import { CasesService, casesConfig } from './services/cases.service';
import { Store } from '@ngrx/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SaveCaseComponent } from './components/save-case/save-case.component';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		InfiniteScrollModule,
		FormsModule,
		EffectsModule.run(CasesEffects),
		BrowserAnimationsModule
	],
	declarations: [CasesComponent, CasesTableComponent, EditCaseComponent, CasesModalContainerComponent, DeleteCaseComponent, CasesToolsComponent, SaveCaseComponent],
	entryComponents: [CasesComponent, EditCaseComponent, SaveCaseComponent, DeleteCaseComponent],
	providers: [CasesService]
})
export class CasesModule {
	static forRoot(config: CasesConfig): ModuleWithProviders {
		return {
			ngModule: CasesModule,
			providers: [
				CasesService,
				{ provide: casesConfig, useValue: config }
			]
		};
	}

	constructor(store: Store<any>) {
		let menu_item: MenuItem = {
			name: "Cases",
			component: CasesComponent,
			icon_url: "/assets/icons/cases.svg"
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
