import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from './reducers/status-bar.reducer';
import { comboBoxesOptions, GEO_FILTERS } from './models/combo-boxes.model';
import { TreeviewModule } from 'ngx-treeview';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ClickOutsideModule } from '../core/click-outside/click-outside.module';
import { OwlDateTimeIntl, OwlDateTimeModule, OwlNativeDateTimeModule } from '@ansyn/ng-pick-datetime';
import { TimePickerTranslateService } from './services/time-picker-translate.service';
import { SearchPanelComponent } from './components/search-panel/search-panel.component';
import { DisplayPanelComponent } from './components/display-panel/display-panel.component';
import { TimePickerComponent } from './components/timepicker/time-picker.component';
import { LocationPickerComponent } from './components/location-picker/location-picker.component';
import { FiltersPanelComponent } from './components/filters-panel/filters-panel.component';
import { FiltersModule } from '../filters/filters.module';
import { TimepickerPresetsComponent } from './components/timepicker-presets/timepicker-presets.component';
import { CasesModule } from '../menu-items/cases/cases.module';

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
		OwlNativeDateTimeModule,
		CasesModule
	],
	declarations: [StatusBarComponent, TreeViewComponent, SearchPanelComponent, DisplayPanelComponent, TimePickerComponent, LocationPickerComponent, FiltersPanelComponent, TimepickerPresetsComponent],
	providers: [
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
