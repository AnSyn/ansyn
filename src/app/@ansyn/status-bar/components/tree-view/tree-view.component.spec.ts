import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { TreeViewComponent } from './tree-view.component';
import { TreeviewModule } from 'ngx-treeview';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { provideMockActions } from '@ngrx/effects/testing';
import {
	IStatusBarState,
	StatusBarInitialState,
	statusBarStateSelector
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { cloneDeep } from 'lodash';
import { OverlaysCriteria } from '@ansyn/core/models/overlay.model';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';

describe('TreeViewComponent', () => {
	let component: TreeViewComponent;
	let fixture: ComponentFixture<TreeViewComponent>;
	let actions: Observable<any>;
	let statusBarState: IStatusBarState;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TreeViewComponent],
			imports: [StoreModule.forRoot({}), TreeviewModule.forRoot()],
			providers: [
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {}, dataInputFiltersConfig: { filters: [] } }
				},
				provideMockActions(() => actions),
				{
					provide: CasesService,
					useValue: {
						defaultCase: { id: 'defualtId' }
					}
				}]
		})
			.compileComponents();
	}));

	let searchParams: OverlaysCriteria = {
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
			[coreStateSelector, coreState],
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
});
