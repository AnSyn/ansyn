import { AddMenuItemAction, SelectMenuItemAction } from '@ansyn/menu';
import { AddCaseSuccessAction, CasesReducer, SelectCaseByIdAction } from '@ansyn/menu-items/cases';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MenuAppEffects } from './menu.app.effects';
import { menuFeatureKey, MenuReducer } from '@ansyn/menu/reducers/menu.reducer';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { IAppState } from '../';
import { RedrawTimelineAction } from '@ansyn/overlays/actions/overlays.actions';
import { ContainerChangedTriggerAction } from '@ansyn/menu/actions/menu.actions';
import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { casesFeatureKey } from '@ansyn/menu-items/cases/reducers/cases.reducer';

describe('MenuAppEffects', () => {
	let menuAppEffects: MenuAppEffects;
	let app_state: IAppState;
	let store: Store<any>;
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [menuFeatureKey]: MenuReducer, [casesFeatureKey]: CasesReducer })],
			providers: [
				provideMockActions(() => actions),
				MenuAppEffects
			]

		}).compileComponents();
	}));


	beforeEach(inject([MenuAppEffects], (_menuAppEffects: MenuAppEffects) => {
		menuAppEffects = _menuAppEffects;
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;

		app_state = {
			cases: {
				cases: [{
					id: 'case1',
					state: {
						selected_overlays_ids: []
					}
				},
					{
						id: 'case2',
						state: {
							selected_overlays_ids: []
						}
					}]
			},
			menu: {
				menu_items: [{
					name: 'Cases',
					component: null,
					iconClass: null

				},
					{
						name: 'Shmases',
						component: null,
						iconClass: null

					}],
				selected_menu_item_index: 1
			}
		} as any;

		store.dispatch(new AddCaseSuccessAction(app_state.cases.cases[0]));
		store.dispatch(new SelectCaseByIdAction(app_state.cases.cases[0].id));
		store.dispatch(new AddMenuItemAction({
			name: 'Cases',
			component: null,
			iconClass: null

		}));
		store.dispatch(new AddMenuItemAction({
			name: 'Shmases',
			component: null,
			iconClass: null

		}));
		store.dispatch(new SelectMenuItemAction('Cases'));

	}));

	it('onContainerChanged$ effect should dispatch UpdateMapSizeAction and RedrawTimelineAction', () => {
		actions = hot('--a--', { a: new ContainerChangedTriggerAction() });
		const expectedResults = cold('--(ab)--', { a: new UpdateMapSizeAction(), b: new RedrawTimelineAction(true) });
		expect(menuAppEffects.onContainerChanged$).toBeObservable(expectedResults);
	});

});
