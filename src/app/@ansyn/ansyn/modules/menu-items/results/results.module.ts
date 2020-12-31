import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../../core/core.module';
import { ResultsTableComponent } from './components/results-table/results-table.component';
import { ResultsComponent } from './components/results/results.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		MapFacadeModule,
		BrowserAnimationsModule
	],
	declarations: [ResultsComponent, ResultsTableComponent],
	exports: [ResultsTableComponent, ResultsComponent]
})
export class ResultsModule {
}
