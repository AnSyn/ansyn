import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { SearchPanelComponent } from './search-panel.component';
import { comboBoxesOptions, GEO_FILTERS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { Store, StoreModule } from '@ngrx/store';
import { StatusBarConfig } from '../../models/statusBar.config';
import {
	IStatusBarState,
	selectGeoFilterStatus,
	statusBarFeatureKey,
	StatusBarReducer
} from '../../reducers/status-bar.reducer';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { MockComponent } from '../../../core/test/mock-component';
import {
	OverlayReducer,
	overlaysFeatureKey,
	selectDataInputFilter, selectRegion,
	selectTime
} from '../../../overlays/reducers/overlays.reducer';
import { ClickOutsideDirective } from '../../../core/click-outside/click-outside.directive';
import { TranslateModule } from '@ngx-translate/core';
import { toolsFeatureKey, ToolsReducer } from '../../../menu-items/tools/reducers/tools.reducer';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { mockIndexProviders } from '../../../core/test/mock-providers';
import { of } from 'rxjs';
import { IOverlaysCriteria } from '../../../overlays/models/overlay.model';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';

const CRITERIA: IOverlaysCriteria = {
	dataInputFilters: {
		filters: [],
		fullyChecked: true
	},
	time: {
		from: new Date(2020, 4, 10),
		to: new Date(2020, 5, 20)
	},
	region: {
		type: 'Point',
		coordinates: [41.22, 32.222]
	}
};
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
		outputs: ['hideMe', 'openTimePicker']
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
				{
					provide: MultipleOverlaysSourceConfig,
					useValue: {
						indexProviders: mockIndexProviders(['provide1', 'provide2', 'provide3'])
					}
				},
				DateTimeAdapter,
				{
					provide: COMPONENT_MODE,
					useValue: false
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SearchPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const mockStore = new Map<any, any>([
			[selectGeoFilterStatus, { type: 'Point', active: true }],
			[selectDataInputFilter, CRITERIA.dataInputFilters],
			[selectTime, CRITERIA.time],
			[selectRegion, CRITERIA.region]
		]);
		spyOn(store, 'select').and.callFake(type => {
			console.log(`asking ${type}`);
			return of(mockStore.get(type))
		});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
