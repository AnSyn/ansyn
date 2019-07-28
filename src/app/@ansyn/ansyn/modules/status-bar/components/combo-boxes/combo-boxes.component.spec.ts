import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ComboBoxesComponent } from './combo-boxes.component';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TimelineTimepickerComponent } from '../timeline-timepicker/timeline-timepicker.component';
import { StatusBarConfig } from '../../models/statusBar.config';
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { UpdateGeoFilterStatus } from '../../actions/status-bar.actions';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { MockComponent } from '../../../core/test/mock-component';
import { OverlayReducer, overlaysFeatureKey } from '../../../overlays/reducers/overlays.reducer';
import { ClickOutsideDirective } from '../../../core/click-outside/click-outside.directive';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';

describe('ComboBoxesComponent', () => {
	let component: ComboBoxesComponent;
	let fixture: ComponentFixture<ComboBoxesComponent>;

	const mockComboBoxOptionComponent = MockComponent({
		selector: 'ansyn-combo-box-option',
		inputs: ['value'],
		outputs: []
	});

	const mockComboBoxComponent = MockComponent({
		selector: 'ansyn-combo-box',
		inputs: ['options', 'comboBoxToolTipDescription', 'ngModel'],
		outputs: ['ngModelChange']
	});
	const ansynTreeView = MockComponent({ selector: 'ansyn-tree-view', outputs: ['closeTreeView'] });
	const ansynComboTrigger = MockComponent({
		selector: 'button[ansynComboBoxTrigger]',
		inputs: ['isActive', 'render', 'ngModel'],
		outputs: ['ngModelChange']
	});
	let store: Store<IStatusBarState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				ComboBoxesComponent,
				mockComboBoxComponent,
				mockComboBoxOptionComponent,
				TimelineTimepickerComponent,
				ansynTreeView,
				ansynComboTrigger,
				ClickOutsideDirective
			],
			imports: [StoreModule.forRoot({
				[statusBarFeatureKey]: StatusBarReducer,
				[overlaysFeatureKey]: OverlayReducer,
				[mapFeatureKey]: MapReducer
			}), EffectsModule.forRoot([]),
				TranslateModule.forRoot()],
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
				},
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		fixture = TestBed.createComponent(ComboBoxesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('eye indicator should be active', () => {
		component.geoFilterStatus.indicator = true;
		fixture.detectChanges();
		let result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(true);
		component.geoFilterStatus.indicator = false;
		fixture.detectChanges();
		result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(false);
	});

	describe('check click on pinPoint flags', () => {
		beforeEach(() => {
			spyOn(store, 'dispatch');
		});

		it('edit-pinpoint', () => {
			spyOn(component, 'geoFilterChanged');
			fixture.nativeElement.querySelector('.edit-pinpoint').click();
			fixture.detectChanges();
			expect(component.geoFilterChanged).toHaveBeenCalled();
		});
		it('button-eye', () => {
			fixture.nativeElement.querySelector('.eye-button').click();
			fixture.detectChanges();

			const indicator = !component.geoFilterStatus.indicator;
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateGeoFilterStatus({ indicator }));
		});
	});


});
