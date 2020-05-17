import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../../core/core.module';
import { ResultsTableComponent } from './components/results-table/results-table.component';
import { ResultsComponent } from './components/results/results.component';
import { InfiniteScrollModule } from '../../../../map-facade/directives/infinite-scroll.module';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		InfiniteScrollModule
	],
	declarations: [ResultsComponent, ResultsTableComponent],
	entryComponents: [ResultsComponent, ResultsTableComponent],
	exports: [ResultsTableComponent]
})
export class ResultsModule {
}
