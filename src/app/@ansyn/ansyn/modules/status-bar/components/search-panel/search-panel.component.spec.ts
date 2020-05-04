import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { SearchPanelComponent } from './search-panel.component';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StatusBarConfig } from '../../models/statusBar.config';
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { MockComponent } from '../../../core/test/mock-component';
import { OverlayReducer, overlaysFeatureKey } from '../../../overlays/reducers/overlays.reducer';
import { ClickOutsideDirective } from '../../../core/click-outside/click-outside.directive';
import { TranslateModule } from '@ngx-translate/core';
import { toolsFeatureKey, ToolsReducer } from '../../../menu-items/tools/reducers/tools.reducer';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';

describe('SearchPanelComponent', () => {
	let component: SearchPanelComponent;
	let fixture: ComponentFixture<SearchPanelComponent>;

	const mockComboBoxOptionComponent = MockComponent({
		selector: 'ansyn-combo-box-option',
		inputs: ['value', 'disabled'],
		outputs: []
	});

	const mockComboBoxComponent = MockComponent({
		selector: 'ansyn-combo-box',
		inputs: ['buttonClass', 'options', 'withArrow', 'alwaysChange', 'comboBoxToolTipDescription', 'ngModel'],
		outputs: ['ngModelChange']
	});
	const ansynTreeView = MockComponent({ selector: 'ansyn-tree-view', outputs: ['closeTreeView'] });
	const ansynComboTrigger = MockComponent({
		selector: 'button[ansynComboBoxTrigger]',
		inputs: ['isActive', 'render', 'ngModel', 'owlDateTimeTrigger', 'withArrow'],
		outputs: ['ngModelChange']
	});
	const ansynTimePicker = MockComponent({
		selector: 'ansyn-timepicker',
		inputs: ['timeRange', 'extraClass', 'trigger'],
		outputs: ['closeTimePicker', 'ansynClickOutside']
	});

	const ansynTimePickerPreset = MockComponent({
		selector: 'ansyn-timepicker-presets',
		outputs: ['hideMe']
	});

	const ansynLocationPicker = MockComponent({
		selector: 'ansyn-location-picker',
		inputs: ['geoFilter']
	});

	let store: Store<IStatusBarState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				SearchPanelComponent,
				mockComboBoxComponent,
				mockComboBoxOptionComponent,
				ansynTreeView,
				ansynComboTrigger,
				ansynTimePicker,
				ansynLocationPicker,
				ansynTimePickerPreset,
				ClickOutsideDirective
			],
			imports: [StoreModule.forRoot({
				[statusBarFeatureKey]: StatusBarReducer,
				[overlaysFeatureKey]: OverlayReducer,
				[mapFeatureKey]: MapReducer,
				[toolsFeatureKey]: ToolsReducer
			}),
				TranslateModule.forRoot()],
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
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				},
				DateTimeAdapter
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		fixture = TestBed.createComponent(SearchPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
