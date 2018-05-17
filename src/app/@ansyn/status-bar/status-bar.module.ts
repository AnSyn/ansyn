import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core/core.module';
import { ComboBoxComponent } from './components/combo-box/combo-box.component';
import { TimelineTimepickerComponent } from './components/timeline-timepicker/timeline-timepicker.component';
import { StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from './reducers/status-bar.reducer';
import {
	comboBoxesOptions,
	DATA_INPUT_FILTERS,
	GEO_FILTERS,
	ORIENTATIONS,
	TIME_FILTERS
} from '@ansyn/status-bar/models/combo-boxes.model';
import { TreeviewModule } from 'ngx-treeview';
import { TreeViewComponent } from '@ansyn/status-bar/components/tree-view/tree-view.component';


@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		CoreModule,
		TreeviewModule.forRoot(),
		StoreModule.forFeature(statusBarFeatureKey, StatusBarReducer)
	],
	declarations: [StatusBarComponent, ComboBoxComponent, TimelineTimepickerComponent, TreeViewComponent],
	providers: [
		{
			provide: DATA_INPUT_FILTERS,
			useValue: comboBoxesOptions.dataInputFilters
		},
		{
			provide: ORIENTATIONS,
			useValue: comboBoxesOptions.orientations
		},
		{
			provide: TIME_FILTERS,
			useValue: comboBoxesOptions.timeFilters
		},
		{
			provide: GEO_FILTERS,
			useValue: comboBoxesOptions.geoFilters
		}
	],

	exports: [StatusBarComponent]
})
export class StatusBarModule {
}
