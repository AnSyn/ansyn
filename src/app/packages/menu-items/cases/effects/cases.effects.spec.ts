import { CasesEffects } from './cases.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { HttpModule } from '@angular/http';
import { CasesService } from '../services/cases.service';
import { Store, combineReducers, StoreModule } from '@ngrx/store';
import { CasesReducer } from '../reducers/cases.reducer';
import {
	AddCaseAction, AddCaseSuccessAction, DeleteCaseAction, DeleteCaseSuccessAction, LoadCasesAction,
	LoadCasesSuccessAction, UpdateCaseAction, SelectCaseByIdAction, LoadCaseAction, LoadCaseSuccessAction,
	LoadDefaultCaseAction, LoadDefaultCaseSuccessAction, UpdateCaseBackendAction
} from '../actions/cases.actions';
import { Observable } from 'rxjs/Rx';
import { Case } from '../models/case.model';
import { compose } from '@ngrx/core';
import { OverlayReducer } from '@ansyn/overlays';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';

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
			imports: [HttpModule, EffectsTestingModule, StoreModule.provideStore(reducer), RouterTestingModule],
			providers: [CasesEffects,
			CasesService,
			{ provide: casesConfig, useValue: { casesBaseUrl: null } }]
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

	it('onDeleteCase$ should call casesService.removeCase with state.action_case_id, and return DeleteCaseSuccessAction', () => {
		let deleted_case: Case = { id: 'new_case_id', name: 'new_case_name' };
		spyOn(casesService, 'removeCase').and.callFake(() => Observable.of(deleted_case));
		effectsRunner.queue(new DeleteCaseAction());
		casesEffects.onDeleteCase$.subscribe((result: AddCaseSuccessAction) => {
			expect(casesService.removeCase).toHaveBeenCalledWith("");
			expect(result instanceof DeleteCaseSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(deleted_case);
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
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;

		store.dispatch(new AddCaseSuccessAction(caseItem));
		effectsRunner.queue(new LoadCaseAction(caseItem.id));

		casesEffects.loadCase$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof SelectCaseByIdAction).toBeTruthy();
			expect(result.payload).toEqual(caseItem.id);
		});
	});

	it('loadCase$ should dispatch LoadCaseSuccessAction if the case is valid but not in the loaded cases', () => {
		const caseItem: Case = {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;
		spyOn(casesService, 'loadCase').and.callFake(() => Observable.of(caseItem));
		effectsRunner.queue(new LoadCaseAction(caseItem.id));

		casesEffects.loadCase$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof LoadCaseSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(<any>caseItem);
		});
	});

	it('loadCase$ should dispatch LoadDefaultCaseAction if the case id is not valid', () => {
		const caseItem: Case = {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;

		spyOn(casesService, 'loadCase').and.callFake(() => Observable.of(null));
		effectsRunner.queue(new LoadCaseAction(caseItem.id));

		casesEffects.loadCase$.subscribe((result: LoadDefaultCaseAction) => {
			expect(result instanceof LoadDefaultCaseAction).toBeTruthy();
		});
	});

	it('loadCaseSuccess$ should dispatch SelectCaseByIdAction with the same case id', () => {
		const caseItem: Case = {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;

		effectsRunner.queue(new LoadCaseSuccessAction(caseItem));

		casesEffects.loadCaseSuccess$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof SelectCaseByIdAction).toBeTruthy();
			expect(result.payload).toEqual(caseItem.id);
		});
	});

	it('loadDefaultCase$ should load the default case and dispatch LoadDefaultCaseSuccessAction', () => {
		const caseItem: Case = {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;
		spyOn(casesService, 'getDefaultCase').and.callFake(() => caseItem);
		effectsRunner.queue(new LoadDefaultCaseAction());

		casesEffects.loadDefaultCase$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof LoadDefaultCaseSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(<any>caseItem);
		});
	});

	it('loadDefaultCaseSuccess$ should dispatch SelectCaseByIdAction with the same case id', () => {
		const caseItem: Case = {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;

		effectsRunner.queue(new LoadCaseSuccessAction(caseItem.id));

		casesEffects.loadDefaultCaseSuccess$.subscribe((result: SelectCaseByIdAction) => {
			expect(result instanceof SelectCaseByIdAction).toBeTruthy();
			expect(result.payload).toEqual(caseItem.id);
		});
	});
});
