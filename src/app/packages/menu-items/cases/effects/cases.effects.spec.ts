import { CasesEffects } from './cases.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { CasesService } from '../services/cases.service';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CasesReducer } from '../reducers/cases.reducer';
import {
	AddCaseAction,
	AddCaseSuccessAction,
	DeleteCaseAction,
	DeleteCaseBackendAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadCasesSuccessAction,
	LoadCaseSuccessAction,
	LoadDefaultCaseAction,
	LoadDefaultCaseSuccessAction,
	OpenModalAction,
	SelectCaseByIdAction,
	SetDefaultCaseQueryParams,
	UpdateCaseAction,
	UpdateCaseBackendAction
} from '../actions/cases.actions';
import { Observable } from 'rxjs/Rx';
import { Case } from '../models/case.model';
import { compose } from '@ngrx/core';
import { OverlayReducer } from '@ansyn/overlays';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';
import { isEqual } from 'lodash';
import { HttpClientModule } from '@angular/common/http';

describe('CasesEffects', () => {
	let casesEffects: CasesEffects;
	let casesService: CasesService;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;

	const appReducer = compose(combineReducers)({ cases: CasesReducer, overlays: OverlayReducer });

	function reducer(state: any, action: any) {
		return appReducer(state, action);
	}

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				EffectsTestingModule,
				StoreModule.provideStore(reducer),
				RouterTestingModule
			],
			providers: [CasesEffects,
				CasesService,
				{ provide: casesConfig, useValue: { baseUrl: null } }]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([CasesEffects, CasesService, EffectsRunner], (_casesEffects: CasesEffects, _casesService: CasesService, _effectsRunner: EffectsRunner) => {
		casesEffects = _casesEffects;
		casesService = _casesService;
		effectsRunner = _effectsRunner;
	}));

	it('should be defined', () => {
		expect(casesEffects).toBeDefined();
	});

	it('loadCases$ should call casesService.loadCases with case last_id from state, and return LoadCasesSuccessAction', () => {
		let loaded_cases: Case[] = [{ id: 'loaded_case1' }, { id: 'loaded_case2' }, { id: 'loaded_case1' }];
		spyOn(casesService, 'loadCases').and.callFake(() => Observable.of(loaded_cases));
		effectsRunner.queue(new LoadCasesAction());
		casesEffects.loadCases$.subscribe((result: LoadCasesSuccessAction) => {
			expect(casesService.loadCases).toHaveBeenCalledWith('-1');
			expect(result instanceof LoadCasesSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(loaded_cases);
		});
	});

	it('onAddCase$ should call casesService.createCase with action.payload(new case), and return AddCaseSuccessAction', () => {
		let new_case_payload: Case = { id: 'new_case_id', name: 'new_case_name' };
		spyOn(casesService, 'createCase').and.callFake(() => Observable.of(new_case_payload));
		effectsRunner.queue(new AddCaseAction(new_case_payload));
		casesEffects.onAddCase$.subscribe((result: AddCaseSuccessAction) => {
			expect(casesService.createCase).toHaveBeenCalledWith(new_case_payload);
			expect(result instanceof AddCaseSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(new_case_payload);
		});
	});

	it('onDeleteCase$ should call DeleteCaseBackendAction. when deleted case equal to selected case LoadDefaultCaseAction should have been called too', () => {

		let deleted_case: Case = { id: 'new_case_id', name: 'new_case_name' };
		store.dispatch(new AddCaseSuccessAction(deleted_case));
		store.dispatch(new SelectCaseByIdAction(deleted_case.id));
		// set active_case_id
		store.dispatch(new OpenModalAction({ component: '', case_id: deleted_case.id }));
		effectsRunner.queue(new DeleteCaseAction());
		casesEffects.onDeleteCase$.subscribe((result: AddCaseSuccessAction) => {
			expect((result instanceof DeleteCaseBackendAction) || (result instanceof LoadDefaultCaseAction)).toBeTruthy();
			if (result instanceof DeleteCaseBackendAction) {
				expect(result.payload).toEqual(deleted_case.id);
			}
		});
	});

	it('onUpdateCase$ should call casesService.updateCase with action.payload("updated_case"), and return UpdateCaseAction', () => {
		let updated_case: Case = {
			id: 'new_case_id',
			name: 'new_case_name'
		};
		effectsRunner.queue(new UpdateCaseAction(updated_case));
		casesEffects.onUpdateCase$.subscribe((result: UpdateCaseAction) => {
			expect(result instanceof UpdateCaseBackendAction).toBeTruthy();
		});
	});

	it('addCaseSuccess$ should select the case being added', () => {
		let added_case: Case = { id: 'new_case_id', name: 'new_case_name' };
		effectsRunner.queue(new AddCaseSuccessAction(added_case));
		casesEffects.addCaseSuccess$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof SelectCaseByIdAction).toBeTruthy();
		});
	});

	it('loadCase$ should select the case loaded case if it exists', () => {
		const caseItem: Case = {
			'id': '31b33526-6447-495f-8b52-83be3f6b55bd'
		} as any;

		store.dispatch(new AddCaseSuccessAction(caseItem));
		effectsRunner.queue(new LoadCaseAction(caseItem.id));

		casesEffects.loadCase$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof SelectCaseByIdAction).toBeTruthy();
			expect(result.payload).toEqual(caseItem.id);
		});
	});

	describe('loadCase$ ', () => {
		it('loadCase$ should dispatch LoadCaseSuccessAction if the case is valid but not in the loaded cases', () => {
			const caseItem: Case = {
				id: '31b33526-6447-495f-8b52-83be3f6b55bd'
			} as any;
			spyOn(casesService, 'loadCase').and.callFake(() => Observable.of(caseItem));
			effectsRunner.queue(new LoadCaseAction(caseItem.id));

			casesEffects.loadCase$.subscribe((result: LoadCaseSuccessAction) => {
				expect(result instanceof LoadCaseSuccessAction).toBeTruthy();
				expect(result.payload).toEqual(<any>caseItem);
			});
		});

		it('loadCase$ should dispatch LoadDefaultCaseAction if the case id is not valid ( throw 404 error )', () => {
			const caseItem: Case = {
				'id': '31b33526-6447-495f-8b52-83be3f6b55bd'
			} as any;

			spyOn(casesService, 'loadCase').and.callFake(() => Observable.throw({ error: 'not found' }));
			effectsRunner.queue(new LoadCaseAction(caseItem.id));

			casesEffects.loadCase$.subscribe((result: LoadDefaultCaseAction) => {
				expect(result instanceof LoadDefaultCaseAction).toBeTruthy();
			});
		});
	});

	it('loadCaseSuccess$ should dispatch SelectCaseByIdAction with the same case id', () => {
		const caseItem: Case = {
			'id': '31b33526-6447-495f-8b52-83be3f6b55bd'
		} as any;

		effectsRunner.queue(new LoadCaseSuccessAction(caseItem));

		casesEffects.loadCaseSuccess$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof SelectCaseByIdAction).toBeTruthy();
			expect(result.payload).toEqual(caseItem.id);
		});
	});

	it('loadDefaultCase$ should dispatch LoadDefaultCaseSuccessAction if default_case is empty, and call setDefaultCaseQueryParams too(mergeMap)', () => {
		const defaultCase: Case = {
			'id': '31b33526-6447-495f-8b52-83be3f6b55bd'
		} as any;

		const defaultCaseWithQueryParmas: Case = {
			'id': '31b33526-6447-495f-8b52-83be3f6b55bd',
			'name': 'queryParamsDefaultCase'
		} as any;

		spyOn(casesService, 'getDefaultCase').and.callFake(() => defaultCase);

		spyOn((<any>casesService).queryParamsHelper, 'updateCaseViaQueryParmas').and.callFake(() => defaultCaseWithQueryParmas);

		effectsRunner.queue(new LoadDefaultCaseAction());
		// mergeMap
		let count = 0;
		casesEffects.loadDefaultCase$.subscribe((result: any) => {
			count = count + 1;
			if (result instanceof SetDefaultCaseQueryParams) {
				expect(isEqual(result.payload, defaultCaseWithQueryParmas)).toBeTruthy();
			}
			if (result instanceof LoadDefaultCaseSuccessAction) {
				expect(isEqual(result.payload, defaultCase)).toBeTruthy();
			}
			if (result instanceof SelectCaseByIdAction) {
				expect(result.payload).toEqual(defaultCase.id);
			}

		});
		expect(count).toEqual(2);
	});

	it('loadDefaultCaseSuccess$ should dispatch SelectCaseByIdAction with the same case id', () => {
		const caseItem: Case = {
			'id': '31b33526-6447-495f-8b52-83be3f6b55bd'
		} as any;

		effectsRunner.queue(new LoadCaseSuccessAction(caseItem));

		casesEffects.loadDefaultCaseSuccess$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof SelectCaseByIdAction).toBeTruthy();
			expect(result.payload).toEqual(caseItem.id);
		});
	});
});
