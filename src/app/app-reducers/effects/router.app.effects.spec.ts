import { SelectMenuItemAction, AddMenuItemAction } from '@ansyn/core';
import { AddCaseSuccessAction, SelectCaseByIdAction, LoadDefaultCaseSuccessAction, CasesReducer } from '@ansyn/menu-items/cases';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule, Action } from '@ngrx/store';
import { MenuAppEffects } from './menu.app.effects';
import { MenuReducer } from '@ansyn/menu/reducers/menu.reducer';
import { AnimationEndAction } from '@ansyn/core/actions/menu.actions';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { IAppState } from '../';
import { RouterAppEffects } from './router.app.effects';
import { routerReducer } from '@ngrx/router-store';

describe('RouterAppEffects', () => {
	let routerAppEffects: RouterAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [EffectsTestingModule, StoreModule.provideStore({ router: routerReducer })],
			providers: [MenuAppEffects]

		}).compileComponents();
	}));


	beforeEach(inject([Store, RouterAppEffects, EffectsRunner], (_store: Store<any>, _routerAppEffects: RouterAppEffects, _effectsRunner: EffectsRunner) => {
		routerAppEffects = _routerAppEffects;
		effectsRunner = _effectsRunner;
		store = _store;
	}));


	// it('selectCaseUpdateRouter$ route to the (non-default) case being selected', () => {
	// 	const caseItem: Case =  {
	// 		"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
	// 	} as any;
    //
	// 	spyOn(router, 'navigate');
    //
	// 	store.dispatch(new AddCaseSuccessAction(caseItem));
	// 	store.dispatch(new SelectCaseByIdAction(caseItem.id));
    //
	// 	effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));
    //
	// 	casesAppEffects.selectCaseUpdateRouter$.subscribe(() => {
	// 		expect(router.navigate).toHaveBeenCalledWith(['', caseItem.id]);
	// 	});
	// });

	// it('selectCaseUpdateRouter$ route to the (default) case being selected', () => {
	// 	spyOn(router, 'navigate');
    //
	// 	store.dispatch(new LoadDefaultCaseSuccessAction(icase_state.default_case));
	// 	store.dispatch(new SelectCaseByIdAction(icase_state.default_case.id));
    //
	// 	effectsRunner.queue(new SelectCaseByIdAction(icase_state.default_case.id));
    //
	// 	casesAppEffects.selectCaseUpdateRouter$.subscribe(() => {
	// 		expect(router.navigate).toHaveBeenCalledWith(['', '']);
	// 	});
	// });


});
