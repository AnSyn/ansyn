import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from './reducers/status-bar.reducer';
import { comboBoxesOptions, GEO_FILTERS, TIME_FILTERS } from './models/combo-boxes.model';
import { TreeviewModule } from 'ngx-treeview';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ClickOutsideModule } from '../core/click-outside/click-outside.module';
import { OwlDateTimeIntl, OwlDateTimeModule, OwlNativeDateTimeModule } from '@ansyn/ng-pick-datetime';
import { TimePickerTranslateService } from './services/time-picker-translate.service';
import { SearchPanelComponent } from './components/search-panel/search-panel.component';
import { DisplayPanelComponent } from './components/display-panel/display-panel.component';
import { CasePanelComponent } from './components/case-panel/case-panel.component';
import { TimePickerComponent } from './components/timepicker/time-picker.component';
import { LocationPickerComponent } from './components/location-picker/location-picker.component';
import { FiltersPanelComponent } from './components/filters-panel/filters-panel.component';
import { FiltersModule } from '../filters/filters.module';
import { TimepickerPresetsComponent } from './components/timepicker-presets/timepicker-presets.component';

@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		CoreModule,
		MapFacadeModule,
		TreeviewModule.forRoot(),
		StoreModule.forFeature(statusBarFeatureKey, StatusBarReducer),
		ClickOutsideModule,
		OwlDateTimeModule,
		FiltersModule,
		OwlNativeDateTimeModule
	],
	declarations: [StatusBarComponent, TreeViewComponent, SearchPanelComponent, DisplayPanelComponent, CasePanelComponent, TimePickerComponent, LocationPickerComponent, FiltersPanelComponent, TimepickerPresetsComponent],
	providers: [
		{
			provide: TIME_FILTERS,
			useValue: comboBoxesOptions.timeFilters
		},
		{
			provide: GEO_FILTERS,
			useValue: comboBoxesOptions.geoFilters
		},
		{
			provide: OwlDateTimeIntl,
			useClass: TimePickerTranslateService
		}
	],

	exports: [StatusBarComponent]
})
export class StatusBarModule {
}
