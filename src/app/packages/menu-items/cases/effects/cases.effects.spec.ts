import { CasesEffects } from './cases.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { HttpModule } from '@angular/http';
import { CasesService } from '../services/cases.service';
import { StoreModule } from '@ngrx/store';
import { CasesReducer } from '../reducers/cases.reducer';
import {
	AddCaseAction, AddCaseSuccessAction, CloseModalAction, DeleteCaseAction, DeleteCaseSuccessAction, LoadCasesAction,
	LoadCasesSuccessAction, UpdateCaseAction, UpdateCaseSuccessAction
} from '../actions/cases.actions';
import { Observable } from 'rxjs';
import { Case } from '../models/case.model';

describe('CasesEffects', () => {
	let casesEffects: CasesEffects;
	let casesService: CasesService;
	let effectsRunner: EffectsRunner;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule, EffectsTestingModule, StoreModule.provideStore({cases: CasesReducer})],
			providers: [CasesEffects, CasesService]
		}).compileComponents();
	}));

	beforeEach(inject([CasesEffects, CasesService, EffectsRunner], (_casesEffects: CasesEffects, _casesService: CasesService, _effectsRunner: EffectsRunner)=>{
		casesEffects = _casesEffects;
		casesService = _casesService;
		effectsRunner = _effectsRunner;
	}));

	it('should be defined', () => {
		expect(casesEffects).toBeDefined();
	});

	it('loadCases$ should call casesService.loadCases with case last_id from state, and return LoadCasesSuccessAction', () => {
		let loaded_cases: Case[] = [{id: 'loaded_case1'}, {id:'loaded_case2'}, {id: 'loaded_case1'}];
		spyOn(casesService, 'loadCases').and.callFake(() => Observable.of(loaded_cases));
		effectsRunner.queue(new LoadCasesAction());
		casesEffects.loadCases$.subscribe((result: LoadCasesSuccessAction) => {
			expect(casesService.loadCases).toHaveBeenCalledWith('-1');
			expect(result instanceof LoadCasesSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(loaded_cases);
		});
	});

	it('onAddCase$ should call casesService.createCase with action.payload(new case), and return AddCaseSuccessAction', () => {
		let new_case_payload: Case = {id: 'new_case_id', name: 'new_case_name'};
		spyOn(casesService, 'createCase').and.callFake(() => Observable.of(new_case_payload));
		effectsRunner.queue(new AddCaseAction(new_case_payload));
		casesEffects.onAddCase$.subscribe((result: AddCaseSuccessAction) => {
			expect(casesService.createCase).toHaveBeenCalledWith(new_case_payload);
			expect(result instanceof AddCaseSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(new_case_payload);
		});
	});

	it('onDeleteCase$ should call casesService.removeCase with state.action_case_id, and return DeleteCaseSuccessAction', () => {
		let deleted_case: Case = {id: 'new_case_id', name: 'new_case_name'};
		spyOn(casesService, 'removeCase').and.callFake(() => Observable.of(deleted_case));
		effectsRunner.queue(new DeleteCaseAction());
		casesEffects.onDeleteCase$.subscribe((result: AddCaseSuccessAction) => {
			expect(casesService.removeCase).toHaveBeenCalledWith("");
			expect(result instanceof DeleteCaseSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(deleted_case);
		});
	});

	it('onUpdateCase$ should call casesService.updateCase with action.payload("updated_case"), and return UpdateCaseSuccessAction', () => {
		let updated_case: Case = {id: 'new_case_id', name: 'new_case_name'};
		spyOn(casesService, 'updateCase').and.callFake(() => Observable.of(updated_case));
		effectsRunner.queue(new UpdateCaseAction(updated_case));
		casesEffects.onUpdateCase$.subscribe((result: UpdateCaseSuccessAction) => {
			expect(casesService.updateCase).toHaveBeenCalledWith(updated_case);
			expect(result instanceof UpdateCaseSuccessAction).toBeTruthy();
			expect(result.payload).toEqual(updated_case);
		});
	});

	it('closeModalAction$ should been called on 3 actions: UPDATE_CASE_SUCCESS, DELETE_CASE_SUCCESS, ADD_CASE_SUCEESS. and return CloseModalAction', () => {
		let updated_case: Case = {id: 'new_case_id', name: 'new_case_name'};
		effectsRunner.queue(new UpdateCaseSuccessAction(updated_case));
		casesEffects.closeModalAction$.subscribe((result: CloseModalAction) => {
			expect(result instanceof CloseModalAction).toBeTruthy();
		})
	});

});
