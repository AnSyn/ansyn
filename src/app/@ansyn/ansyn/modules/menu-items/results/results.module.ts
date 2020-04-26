import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../../core/core.module';
import { ResultsTableComponent } from './components/results-table/results-table.component';
import { ResultsComponent } from './components/results/results.component';
import { IResultsConfig } from "./models/results-config";

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		CoreModule,
	],
	declarations: [ResultsComponent, ResultsTableComponent],
	entryComponents: [ResultsComponent, ResultsTableComponent],
	exports: [ResultsTableComponent]
})
export class ResultsModule {
}
