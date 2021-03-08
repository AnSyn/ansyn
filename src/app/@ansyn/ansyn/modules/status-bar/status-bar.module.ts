import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from './reducers/status-bar.reducer';
import { comboBoxesOptions, GEO_FILTERS } from './models/combo-boxes.model';
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
import { ToolsModule } from './components/tools/tools.module';
import { TimePickerContainerComponent } from './components/time-picker-container/time-picker-container.component';
import { SearchOptionsComponent } from './components/search-options/search-options.component';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CasesModule } from '../menu-items/cases/cases.module';
import { LogoPanelComponent } from './components/logo-panel/logo-panel.component';
import { FourViewsFilterComponent } from '../four-views/four-views-filter/four-views-filter.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@NgModule({
	imports: [
		TranslateModule,
		FormsModule,
		CommonModule,
		CoreModule,
		ToolsModule,
		MapFacadeModule,
		CasesModule,
		StoreModule.forFeature(statusBarFeatureKey, StatusBarReducer),
		ClickOutsideModule,
		OwlDateTimeModule,
		FiltersModule,
		OwlNativeDateTimeModule,
		NgxSliderModule
	],
	declarations: [StatusBarComponent, SearchPanelComponent, DisplayPanelComponent, LogoPanelComponent, TimePickerComponent, LocationPickerComponent, FiltersPanelComponent, TimepickerPresetsComponent, TimePickerContainerComponent, SearchOptionsComponent, AdvancedSearchComponent, FourViewsFilterComponent],
	providers: [
		{
			provide: GEO_FILTERS,
			useValue: comboBoxesOptions.geoFilters
		},
		{
			provide: OwlDateTimeIntl,
			useClass: TimePickerTranslateService
		},
		TranslateService
	],

	exports: [StatusBarComponent, TimePickerContainerComponent]
})
export class StatusBarModule {
}
