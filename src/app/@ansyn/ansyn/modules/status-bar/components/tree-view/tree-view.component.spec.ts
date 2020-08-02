import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { TreeviewModule } from 'ngx-treeview';
import { Observable, of } from 'rxjs';
import { SliderCheckboxComponent } from '../../../core/forms/slider-checkbox/slider-checkbox.component';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import {
	OverlayReducer,
	overlaysFeatureKey,
	selectDataInputFilter,
	selectOverlaysCriteria,
	selectRegion,
	selectTime
} from '../../../overlays/reducers/overlays.reducer';
import { IStatusBarState, StatusBarInitialState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import { TreeViewComponent } from './tree-view.component';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { IOverlaysCriteria } from '../../../overlays/models/overlay.model';
import { mockIndexProviders } from '../../../core/test/mock-providers';
import { MockPipe } from '../../../core/test/mock-pipe';

const overlaysCriteria: IOverlaysCriteria = {
	time: { from: new Date(), to: new Date() },
	region: { type: 'Point', coordinates: [122.00, 44.122] },
	dataInputFilters: { fullyChecked: true, filters: [] }
};
describe('TreeViewComponent', () => {
	let component: TreeViewComponent;
	let fixture: ComponentFixture<TreeViewComponent>;
	let actions: Observable<any>;
	let statusBarState: IStatusBarState;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TreeViewComponent,
				SliderCheckboxComponent,
				MockPipe('translate')
			],
			imports: [
				StoreModule.forRoot({
					[overlaysFeatureKey]: OverlayReducer
				}),
				TreeviewModule.forRoot()],
			providers: [
				{
					provide: MultipleOverlaysSourceConfig,
					useValue: {
						indexProviders: mockIndexProviders(['provide1', 'provide2', 'provide3'])
					}
				},
				provideMockActions(() => actions),
				{
					provide: TranslateService,
					useValue: {
						instant: (x) => x,
						get: (x) => of(x)
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store) => {
		store = _store;
		statusBarState = cloneDeep(StatusBarInitialState);
		const fakeStore = new Map<any, any>([
			[statusBarStateSelector, statusBarState],
			[selectOverlaysCriteria, overlaysCriteria],
			[selectRegion, overlaysCriteria.region],
			[selectTime, overlaysCriteria.time],
			[selectDataInputFilter, overlaysCriteria.dataInputFilters]
		]);

		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should init treeview items correctly', () => {
		expect(component.dataInputFiltersItems[0].text).toEqual('provide1');
		expect(component.dataInputFiltersItems[0].checked).toEqual(true);
		expect(component.dataInputFiltersItems[0].children[0].text).toEqual('sensor1');
		expect(component.dataInputFiltersItems[0].children[0].checked).toEqual(true);
		expect(component.dataInputFiltersItems[0].children[0].value).toEqual({
			providerName: 'provide1',
			sensorType: 'sensor1'
		});
	});

	it('on check/unCheck should SetOverlaysCriteriaAction', () => {
		spyOn(store, 'dispatch');
		component.selectedFilters = [{ providerName: 'provide2', sensorType: 'sensor2', sensorName: 'sensor2' }];
		fixture.detectChanges();
		expect(store.dispatch).toHaveBeenCalledWith(new SetOverlaysCriteriaAction({
				dataInputFilters: {
					fullyChecked: false,
					filters: [{ providerName: 'provide2', sensorType: 'sensor2', sensorName: 'sensor2' }]
				}
			}, { noInitialSearch: false }
		));
	});

	it('on uncheck all should fire SetOverlaysCriteriaAction with noInitialSearch true', () => {
		spyOn(store, 'dispatch');
		component.selectedFilters = [];
		fixture.detectChanges();
		expect(store.dispatch).toHaveBeenCalledWith(new SetOverlaysCriteriaAction({
				dataInputFilters: {
					fullyChecked: false,
					filters: []
				}
			}, { noInitialSearch: true }
		));
	})
});
