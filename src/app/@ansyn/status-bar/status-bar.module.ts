import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core';
import { ComboBoxComponent } from './components/combo-box/combo-box.component';
import { TimelineTimepickerComponent } from './components/timeline-timepicker/timeline-timepicker.component';
import { TimelineIntervalsPickerComponent } from './components/timeline-intervals-picker/timeline-intervals-picker.component';
import { StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from './reducers/status-bar.reducer';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '@ansyn/status-bar/models';


@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		CoreModule,
		StoreModule.forFeature(statusBarFeatureKey, StatusBarReducer)
	],
	declarations: [
		StatusBarComponent,
		ComboBoxComponent,
		TimelineTimepickerComponent,
		TimelineIntervalsPickerComponent
	],
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
