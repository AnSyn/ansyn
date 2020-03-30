import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { LocationPickerComponent } from './location-picker.component';
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { GEO_FILTERS } from '../../models/combo-boxes.model';
import { CaseGeoFilter } from '../../../menu-items/cases/models/case.model';
import { UpdateGeoFilterStatus } from '../../actions/status-bar.actions';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AnsynFormsModule } from '../../../core/forms/ansyn-forms.module';

describe('LocationPickerComponent', () => {
	let component: LocationPickerComponent;
	let fixture: ComponentFixture<LocationPickerComponent>;
	let store: Store<IStatusBarState>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LocationPickerComponent],
			imports: [StoreModule.forRoot({[statusBarFeatureKey]: StatusBarReducer}),
				TranslateModule.forRoot(),
				FormsModule,
				AnsynFormsModule
			],
			providers: [{
				provide: GEO_FILTERS,
				useValue: []
			}]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LocationPickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('on change fire updateGeoFilter action', () => {
		spyOn(store, 'dispatch');
		component.change(CaseGeoFilter.PinPoint);
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateGeoFilterStatus({type: CaseGeoFilter.PinPoint}));
	})
});
