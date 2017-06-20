import { AddCaseSuccessAction, SelectCaseByIdAction, Case, CasesReducer, LoadDefaultCaseSuccessAction  } from '@ansyn/menu-items/cases';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { RouterAppEffects } from './router.app.effects';
import { routerReducer } from '@ngrx/router-store';
import * as routerActions from '@ngrx/router-store/src/actions';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterStoreHelperService } from '../services/router-store-helper.service';

describe('RouterAppEffects', () => {
	let routerAppEffects: RouterAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, EffectsTestingModule, StoreModule.provideStore({ router: routerReducer, cases: CasesReducer })],
			providers: [RouterAppEffects, RouterStoreHelperService]

		}).compileComponents();
	}));


	beforeEach(inject([Store, RouterAppEffects, EffectsRunner], (_store: Store<any>, _routerAppEffects: RouterAppEffects, _effectsRunner: EffectsRunner) => {
		routerAppEffects = _routerAppEffects;
		effectsRunner = _effectsRunner;
		store = _store;
	}));


	it('selectCaseUpdateRouter$ route to the (non-default) case being selected', () => {
		const caseItem: Case =  {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;

		spyOn(routerActions, 'go');

		store.dispatch(new AddCaseSuccessAction(caseItem));
		store.dispatch(new SelectCaseByIdAction(caseItem.id));

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));

		routerAppEffects.selectCaseUpdateRouter$.subscribe(() => {
			expect(routerActions.go).toHaveBeenCalledWith(['', caseItem.id]);
		});
	});

	it('selectDefulatCaseById$ route to the (default) case being selected', () => {
		spyOn(routerActions, 'go');

		const default_case: Case = {
			id: '1234-5678',
		} as any;

		store.dispatch(new LoadDefaultCaseSuccessAction(default_case));
		effectsRunner.queue(new SelectCaseByIdAction(default_case.id));

		routerAppEffects.selectDefulatCaseById$.subscribe(() => {
			expect(routerActions.go).toHaveBeenCalledWith(['', '']);
		});
	});


});
