import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MissingTranslationHandler, TranslateModule, USE_DEFAULT_LANG } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { TreeviewModule } from 'ngx-treeview';
import { Observable, of } from 'rxjs';
import { SliderCheckboxComponent } from '../../../core/forms/slider-checkbox/slider-checkbox.component';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { OverlayReducer, overlaysFeatureKey, selectDataInputFilter } from '../../../overlays/reducers/overlays.reducer';
import { IStatusBarState, StatusBarInitialState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import { TreeViewComponent } from './tree-view.component';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';

describe('TreeViewComponent', () => {
	let component: TreeViewComponent;
	let fixture: ComponentFixture<TreeViewComponent>;
	let actions: Observable<any>;
	let statusBarState: IStatusBarState;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TreeViewComponent, SliderCheckboxComponent],
			imports: [
				TranslateModule.forRoot(),
				StoreModule.forRoot({
					[overlaysFeatureKey]: OverlayReducer
				}),
				TreeviewModule.forRoot()],
			providers: [
				{ provide: USE_DEFAULT_LANG },
				{
					provide: MissingTranslationHandler, useValue: {
						handle: () => ''
					}
				},
				{
					provide: MultipleOverlaysSourceConfig,
					useValue: {
						indexProviders: {}
					}
				},
				provideMockActions(() => actions)
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store) => {
		store = _store;
		statusBarState = cloneDeep(StatusBarInitialState);
		const fakeStore = new Map<any, any>([
			[statusBarStateSelector, statusBarState],
			[selectDataInputFilter, ['dataInput1', 'dataInput2']]
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

	it('on check/unCheck should SetOverlaysCriteriaAction', () => {
		spyOn(store, 'dispatch');
		const selectFilter = [...component._selectedFilters];
		selectFilter.pop();
		component.selectedFilters = selectFilter;
		fixture.detectChanges();
		expect(store.dispatch).toHaveBeenCalledWith(new SetOverlaysCriteriaAction({dataInputFilters: {
				fullyChecked: false,
				filters: selectFilter
			}}));
	});
});
