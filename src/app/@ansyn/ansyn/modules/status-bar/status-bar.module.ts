import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { TimelineTimepickerComponent } from './components/timeline-timepicker/timeline-timepicker.component';
import { StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from './reducers/status-bar.reducer';
import { comboBoxesOptions, GEO_FILTERS, TIME_FILTERS } from './models/combo-boxes.model';
import { TreeviewModule } from 'ngx-treeview';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { ComboBoxesComponent } from './components/combo-boxes/combo-boxes.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ClickOutsideModule } from '../core/click-outside/click-outside.module';

@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		CoreModule,
		MapFacadeModule,
		TreeviewModule.forRoot(),
		StoreModule.forFeature(statusBarFeatureKey, StatusBarReducer),
		ClickOutsideModule
	],
	declarations: [StatusBarComponent, TimelineTimepickerComponent, TreeViewComponent, NavigationBarComponent, ComboBoxesComponent],
	providers: [
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
