import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ComboBoxesComponent } from './combo-boxes.component';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MockComponent } from '../../../core/test/mock-component';
import { TimelineTimepickerComponent } from '../timeline-timepicker/timeline-timepicker.component';
import { StatusBarConfig } from '../../models/statusBar.config';
import { coreFeatureKey, CoreReducer } from '../../../core/reducers/core.reducer';
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';

fdescribe('ComboBoxesComponent', () => {
	let component: ComboBoxesComponent;
	let fixture: ComponentFixture<ComboBoxesComponent>;
	const mockComboBoxComponent = MockComponent({ selector: 'ansyn-combo-box', inputs: ['options', 'selected', 'renderFunction', 'comboBoxToolTipDescription'], outputs: ['comboBoxToolTipDescription', 'selectedChange'] });
	const ansynTreeView = MockComponent({ selector: 'ansyn-tree-view', outputs: ['closeTreeView'] });
	const ansynComboTrigger = MockComponent({ selector: 'ansyn-combo-box-trigger', inputs: ['isActive', 'comboBoxToolTipDescription', 'render'] });
	let store: Store<IStatusBarState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ComboBoxesComponent, mockComboBoxComponent, TimelineTimepickerComponent, ansynTreeView, ansynComboTrigger],
			imports: [StoreModule.forRoot({ [coreFeatureKey]: CoreReducer, [statusBarFeatureKey]: StatusBarReducer }), EffectsModule.forRoot([])],
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
				},
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
		let result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(true);
		component.flags.set(statusBarFlagsItemsEnum.geoFilterIndicator, false);
		fixture.detectChanges();
		result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(false);
	});

	describe('check click on pinPoint flags', () => {
		beforeEach(() => {
			spyOn(store, 'dispatch');
		});

		it('edit-pinpoint', () => {
			fixture.nativeElement.querySelector('.edit-pinpoint').click();
			fixture.detectChanges();
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch }));
		});
		it('button-eye', () => {
			fixture.nativeElement.querySelector('.eye-button').click();
			fixture.detectChanges();
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterIndicator }));
		});
	});


});
