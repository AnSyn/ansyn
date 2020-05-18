import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../../core/core.module';
import { ResultsTableComponent } from './components/results-table/results-table.component';
import { ResultsComponent } from './components/results/results.component';
import { MapFacadeModule } from '@ansyn/map-facade';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		MapFacadeModule,
	],
	declarations: [ResultsComponent, ResultsTableComponent],
	entryComponents: [ResultsComponent, ResultsTableComponent],
	exports: [ResultsTableComponent]
})
export class ResultsModule {
}
