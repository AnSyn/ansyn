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
	GEO_FILTERS,
	ORIENTATIONS,
	TIME_FILTERS
} from '@ansyn/status-bar/models/combo-boxes.model';
import { TreeviewModule } from 'ngx-treeview';
import { TreeViewComponent } from '@ansyn/status-bar/components/tree-view/tree-view.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { ComboBoxesComponent } from './components/combo-boxes/combo-boxes.component';
import { SelectedCaseBarComponent } from './components/selected-case-bar/selected-case-bar.component';
import { ComboBoxTriggerComponent } from './components/combo-box-trigger/combo-box-trigger.component';


@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		CoreModule,
		TreeviewModule.forRoot(),
		StoreModule.forFeature(statusBarFeatureKey, StatusBarReducer)
	],
	declarations: [StatusBarComponent, ComboBoxComponent, TimelineTimepickerComponent, TreeViewComponent, NavigationBarComponent, ComboBoxesComponent, SelectedCaseBarComponent, ComboBoxTriggerComponent],
	providers: [
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
