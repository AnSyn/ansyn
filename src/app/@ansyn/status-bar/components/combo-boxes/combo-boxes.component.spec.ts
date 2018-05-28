import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboBoxesComponent } from './combo-boxes.component';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MockComponent } from '../../../core/test/mock-component';
import { TimelineTimepickerComponent } from '../timeline-timepicker/timeline-timepicker.component';
import { StatusBarConfig } from '../../models/statusBar.config';
import { coreFeatureKey, CoreReducer } from '../../../core/reducers/core.reducer';
import { statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';

describe('ComboBoxesComponent', () => {
	let component: ComboBoxesComponent;
	let fixture: ComponentFixture<ComboBoxesComponent>;
	const mockComboBoxComponent = MockComponent({ selector: 'ansyn-combo-box', inputs: ['options', 'selected', 'renderFunction', 'comboBoxToolTipDescription'], outputs: ['comboBoxToolTipDescription', 'selectedChange'] });
	const ansynTreeView = MockComponent({ selector: 'ansyn-tree-view', outputs: ['closeTreeView'] });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ComboBoxesComponent, mockComboBoxComponent, TimelineTimepickerComponent, ansynTreeView],
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

	beforeEach(() => {
		fixture = TestBed.createComponent(ComboBoxesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	// it('eye indicator should be active', () => {
	// 	let result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
	// 	expect(result).toBe(true);
	// 	component.flags.set(statusBarFlagsItemsEnum.geoFilterIndicator, false);
	// 	fixture.detectChanges();
	// 	result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
	// 	expect(result).toBe(false);
	// });
	//
	// describe('check click on pinPoint flags', () => {
	// 	beforeEach(() => {
	// 		spyOn(store, 'dispatch');
	// 	});
	//
	// 	it('edit-pinpoint', () => {
	// 		fixture.nativeElement.querySelector('.edit-pinpoint').click();
	// 		fixture.detectChanges();
	// 		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch }));
	// 	});
	// 	it('button-eye', () => {
	// 		fixture.nativeElement.querySelector('.eye-button').click();
	// 		fixture.detectChanges();
	// 		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterIndicator }));
	// 	});
	// });
	//

});
