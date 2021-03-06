import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { DisplayPanelComponent } from './display-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from '../../../core/test/mock-component';
import { Store, StoreModule } from '@ngrx/store';
import {
	IStatusBarState,
	statusBarFeatureKey,
	StatusBarReducer
} from '../../reducers/status-bar.reducer';
import { mapFeatureKey, MapReducer, selectLayout, SetLayoutAction } from '@ansyn/map-facade';
import { of } from 'rxjs';
import { comboBoxesOptions } from '../../models/combo-boxes.model';
import { StatusBarConfig } from '../../models/statusBar.config';

describe('DisplayPanelComponent', () => {
	let component: DisplayPanelComponent;
	let fixture: ComponentFixture<DisplayPanelComponent>;
	let store: Store<any>;

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

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [DisplayPanelComponent,
			mockComboBoxComponent,
			mockComboBoxOptionComponent],
			imports: [StoreModule.forRoot({
				[statusBarFeatureKey]: StatusBarReducer,
				[mapFeatureKey]: MapReducer
			}),
				TranslateModule.forRoot()],
			providers: [
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DisplayPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		store = _store;
		const mockStore = new Map<any, any>([
			[selectLayout, 'layout3'],
		]);

		spyOn(store, 'select').and.callFake(type => of(mockStore.get(type)));
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('on select layout fire SetLayoutAction action', () => {
		spyOn(store, 'dispatch');
		component.layoutSelectChange('layout3');
		expect(store.dispatch).toHaveBeenCalledWith(new SetLayoutAction('layout3'))
	});
});
