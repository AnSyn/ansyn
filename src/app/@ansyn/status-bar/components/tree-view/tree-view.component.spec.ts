import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { TreeViewComponent } from './tree-view.component';
import { TreeviewModule } from 'ngx-treeview';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { IStatusBarState, StatusBarInitialState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import { cloneDeep } from 'lodash';
import { coreInitialState, coreStateSelector, IOverlaysCriteria, SliderCheckboxComponent } from '@ansyn/core';
import { By } from '@angular/platform-browser';
import { MissingTranslationHandler, TranslateModule, USE_DEFAULT_LANG } from '@ngx-translate/core';

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
				StoreModule.forRoot({}),
				TreeviewModule.forRoot()],
			providers: [
				{ provide: USE_DEFAULT_LANG },
				MissingTranslationHandler,
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {}, dataInputFiltersConfig: {} }
				},
				provideMockActions(() => actions)
			]
		})
			.compileComponents();
	}));

	let searchParams: IOverlaysCriteria = {
		region: {
			'type': 'Polygon',
			'coordinates': [
				[
					[
						-14.4140625,
						59.99349233206085
					],
					[
						37.96875,
						59.99349233206085
					],
					[
						37.96875,
						35.915747419499695
					],
					[
						-14.4140625,
						35.915747419499695
					],
					[
						-14.4140625,
						59.99349233206085
					]
				]
			]
		},
		time: {
			type: 'absolute',
			from: new Date(2020),
			to: new Date()
		}
	};

	const coreState = { ...coreInitialState, searchParams };

	beforeEach(inject([Store], (_store) => {
		store = _store;
		statusBarState = cloneDeep(StatusBarInitialState);
		const fakeStore = new Map<any, any>([
			[statusBarStateSelector, statusBarState],
			[coreStateSelector, coreState]
		]);

		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('ok button shall invoke the dataInputFiltersOk function', () => {
		const element = fixture.debugElement.query(By.css('.ok-button')).nativeElement;
		spyOn(component, 'dataInputFiltersOk');
		fixture.detectChanges();
		element.click();
		expect(component.dataInputFiltersOk).toHaveBeenCalled();
		fixture.detectChanges();
	});
});
