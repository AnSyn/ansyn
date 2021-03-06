import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { LocationPickerComponent } from './location-picker.component';
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { GEO_FILTERS } from '../../models/combo-boxes.model';
import { CaseGeoFilter } from '../../../menu-items/cases/models/case.model';
import { UpdateGeoFilterStatus } from '../../actions/status-bar.actions';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AnsynFormsModule } from '../../../core/forms/ansyn-forms.module';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { StatusBarConfig } from '../../models/statusBar.config';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { COMPONENT_MODE } from 'src/app/@ansyn/ansyn/app-providers/component-mode';
import { SearchOptionsComponent } from '../search-options/search-options.component';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';

describe('LocationPickerComponent', () => {
	let component: LocationPickerComponent;
	let fixture: ComponentFixture<LocationPickerComponent>;
	let store: Store<IStatusBarState>;
	beforeEach(waitForAsync(() => {
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
			},
			SearchPanelComponent,
			{
				provide: StatusBarConfig,
				useValue: []
			},
			{
				provide: MultipleOverlaysSourceConfig,
				useValue: []
			},
			{
				provide: COMPONENT_MODE,
				useValue: false
			},
			SearchOptionsComponent,
			DateTimeAdapter
		]
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
