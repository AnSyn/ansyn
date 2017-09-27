import { AddMenuItemAction, SelectMenuItemAction } from '@ansyn/menu';
import { AddCaseSuccessAction, CasesReducer, SelectCaseByIdAction } from '@ansyn/menu-items/cases';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MenuAppEffects } from './menu.app.effects';
import { MenuReducer } from '@ansyn/menu/reducers/menu.reducer';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { IAppState } from '../';
import { RedrawTimelineAction } from '@ansyn/overlays/actions/overlays.actions';
import { ContainerChangedTriggerAction } from '@ansyn/menu/actions/menu.actions';

describe('MenuAppEffects', () => {
	let menuAppEffects: MenuAppEffects;
	let effectsRunner: EffectsRunner;
	let app_state: IAppState;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [EffectsTestingModule, StoreModule.provideStore({ menu: MenuReducer, cases: CasesReducer })],
			providers: [MenuAppEffects]

		}).compileComponents();
	}));


	beforeEach(inject([MenuAppEffects, EffectsRunner], (_menuAppEffects: MenuAppEffects, _effectsRunner: EffectsRunner) => {
		menuAppEffects = _menuAppEffects;
		effectsRunner = _effectsRunner;
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
					iconUrl: null

				},
					{
						name: 'Shmases',
						component: null,
						iconUrl: null

					}],
				selected_menu_item_index: 1
			}
		} as any;

		store.dispatch(new AddCaseSuccessAction(app_state.cases.cases[0]));
		store.dispatch(new SelectCaseByIdAction(app_state.cases.cases[0].id));
		store.dispatch(new AddMenuItemAction({
			name: 'Cases',
			component: null,
			iconUrl: null

		}));
		store.dispatch(new AddMenuItemAction({
			name: 'Shmases',
			component: null,
			iconUrl: null

		}));
		store.dispatch(new SelectMenuItemAction('Cases'));

	}));

	it('onContainerChanged$ effect should dispatch UpdateMapSizeAction and RedrawTimelineAction', () => {
		let count = 0;
		let action: ContainerChangedTriggerAction = new ContainerChangedTriggerAction();
		effectsRunner.queue(action);
		menuAppEffects.onContainerChanged$.subscribe((_result: UpdateMapSizeAction | RedrawTimelineAction | any) => {
			expect(_result instanceof UpdateMapSizeAction || _result instanceof RedrawTimelineAction).toBeTruthy();
			count = count + 1;
		});
		expect(count).toEqual(2);
	});

});
