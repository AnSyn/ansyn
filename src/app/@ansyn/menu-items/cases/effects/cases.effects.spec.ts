import { CasesEffects } from './cases.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesService } from '../services/cases.service';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '../reducers/cases.reducer';
import {
	AddCaseAction,
	DeleteCaseAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	OpenModalAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	UpdateCaseAction,
	UpdateCaseBackendAction
} from '../actions/cases.actions';
import { Observable } from 'rxjs/Rx';
import { Case } from '../models/case.model';
import { OverlayReducer } from '@ansyn/overlays';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { Params } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { ErrorHandlerService } from '@ansyn/core';
import { AddCasesAction } from '@ansyn/menu-items';

describe('CasesEffects', () => {
	let casesEffects: CasesEffects;
	let casesService: CasesService;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer, [overlaysFeatureKey]: OverlayReducer }),
				RouterTestingModule
			],
			providers: [CasesEffects,
				CasesService,
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => Observable.throw(null) }
				},
				provideMockActions(() => actions),
				{ provide: casesConfig, useValue: { baseUrl: null, defaultCase: { id: 'defaultCaseId' } } }]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([CasesEffects, CasesService], (_casesEffects: CasesEffects, _casesService: CasesService) => {
		casesEffects = _casesEffects;
		casesService = _casesService;

	}));

	it('should be defined', () => {
		expect(casesEffects).toBeDefined();
	});

	it('loadCases$ should call casesService.loadCases with case lastId from state, and return LoadCasesSuccessAction', () => {
		let loadedCases: Case[] = [{ id: 'loadedCase1' }, { id: 'loadedCase2' }, { id: 'loadedCase1' }];
		spyOn(casesService, 'loadCases').and.callFake(() => Observable.of(loadedCases));
		actions = hot('--a--', { a: new LoadCasesAction() });
		const expectedResults = cold('--b--', { b: new AddCasesAction(loadedCases) });
		expect(casesEffects.loadCases$).toBeObservable(expectedResults);
	});

	it('onAddCase$ should call casesService.createCase with action.payload(new case), and return AddCaseSuccessAction', () => {
		let newCasePayload: Case = { id: 'newCaseId', name: 'newCaseName' };
		spyOn(casesService, 'createCase').and.callFake(() => Observable.of(newCasePayload));
		actions = hot('--a--', { a: new AddCaseAction(newCasePayload) });
		const expectedResults = cold('--a--', { a: new SelectCaseAction(newCasePayload) });
		expect(casesEffects.onAddCase$).toBeObservable(expectedResults);

	});

	it('onDeleteCase$ should call DeleteCaseBackendAction. when deleted case equal to selected case LoadDefaultCaseAction should have been called too', () => {

		// let deletedCase: Case = { id: 'newCaseId', name: 'newCaseName' };
		// store.dispatch(new AddCaseAction(deletedCase));
		// store.dispatch(new SelectCaseAction(deletedCase));
		// store.dispatch(new OpenModalAction({ component: '', caseId: deletedCase.id }));
		// actions = hot('--a--', { a: new DeleteCaseAction('') });
		// const expectedResults = cold('--(a)--', {
		// 	a: new LoadDefaultCaseAction()
		// });
		// expect(casesEffects.onDeleteCase$).toBeObservable(expectedResults);
	});

	it('onUpdateCase$ should call casesService.updateCase with action.payload("updatedCase"), and return UpdateCaseAction', () => {
		const updatedCase: Case = { id: 'updatedCaseId' };
		actions = hot('--a--', { a: new UpdateCaseAction(updatedCase) });
		const expectedResults = cold('--b--', { b: new UpdateCaseBackendAction(updatedCase) });
		expect(casesEffects.onUpdateCase$).toBeObservable(expectedResults);
	});

	it('loadCase$ should select the case if exists', () => {
		const caseItem: Case = { id: '31b33526-6447-495f-8b52-83be3f6b55bd' } as any;
		store.dispatch(new AddCaseAction(caseItem));
		actions = hot('--a--', { a: new LoadCaseAction(caseItem.id) });
		const expectedResults = cold('--b--', {
			b: new SelectCaseAction(caseItem)
		});
		expect(casesEffects.loadCase$).toBeObservable(expectedResults);
	});

	describe('loadCase$ ', () => {
		it('loadCase$ should dispatch SelectCaseAction', () => {
			const caseItem: Case = {
				id: '31b33526-6447-495f-8b52-83be3f6b55bd'
			} as any;
			spyOn(casesService, 'loadCase').and.callFake(() => Observable.of(caseItem));
			actions = hot('--a--', { a: new LoadCaseAction(caseItem.id) });
			const expectedResults = cold('--b--', { b: new SelectCaseAction(<any>caseItem) });
			expect(casesEffects.loadCase$).toBeObservable(expectedResults);
		});

		it('loadCase$ should dispatch LoadDefaultCaseAction if the case id is not valid ( throw 404 error )', () => {
			const caseItem: Case = {
				'id': '31b33526-6447-495f-8b52-83be3f6b55bd'
			} as any;

			spyOn(casesService, 'loadCase').and.callFake(() => Observable.throw({ error: 'not found' }));
			actions = hot('--a--', { a: new LoadCaseAction(caseItem.id) });
			const expectedResults = cold('--b--', { b: new LoadDefaultCaseAction() });
			expect(casesEffects.loadCase$).toBeObservable(expectedResults);
		});
	});

	it('loadDefaultCase$ should call updateCaseViaQueryParmas and dispatch SelectCaseAction ', () => {
		spyOnProperty(casesService, 'defaultCase', 'get').and.returnValue({ id: '31b33526-6447-495f-8b52-83be3f6b55bd' } as any);
		spyOn(casesService.queryParamsHelper, 'updateCaseViaQueryParmas')
			.and
			.returnValue('updateCaseViaQueryParmasResult');
		const queryParmas: Params = { foo: 'bar' };
		actions = hot('--a--', { a: new LoadDefaultCaseAction(queryParmas) });
		const expectedResults = cold('--b--', { b: new SelectCaseAction('updateCaseViaQueryParmasResult' as Case) });
		expect(casesEffects.loadDefaultCase$).toBeObservable(expectedResults);
	});

	it('onSaveCaseAs$ should add a default case', () => {
		const selectedCase = { id: 'selectedCaseId' } as Case;
		spyOn(casesService, 'createCase').and.returnValue(Observable.of(selectedCase));
		actions = hot('--a--', { a: new SaveCaseAsAction(selectedCase) });
		const expectedResults = cold('--b--', { b: new SaveCaseAsSuccessAction(selectedCase) });
		expect(casesEffects.onSaveCaseAs$).toBeObservable(expectedResults);
	});

});
