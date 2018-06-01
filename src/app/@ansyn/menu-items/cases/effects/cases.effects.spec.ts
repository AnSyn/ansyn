import { CasesEffects } from './cases.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { casesConfig, CasesService } from '../services/cases.service';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '../reducers/cases.reducer';
import {
	AddCaseAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	UpdateCaseAction,
	UpdateCaseBackendAction
} from '../actions/cases.actions';
import { Observable } from 'rxjs/Rx';
import { Case } from '../models/case.model';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Params } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { AddCasesAction, LoadDefaultCaseIfNoActiveCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { OverlaysConfig } from '@ansyn/overlays/services/overlays.service';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { CaseGeoFilter } from '@ansyn/core/models/case.model';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';

describe('CasesEffects', () => {
	let casesEffects: CasesEffects;
	let casesService: CasesService;
	let loggerService: LoggerService;
	let actions: Observable<any>;
	let store: Store<any>;

	const fakeOverlay = <Overlay> { id: 'test' };


	const caseMock: Case = {
		id: 'case1',
		name: 'name',
		owner: 'owner',
		creationTime: new Date(),
		lastModified: new Date(),
		state: {
			maps: {
				activeMapId: '5555',
				data: [
					{
						id: '5555',
						data: {}

					},
					{
						id: '4444',
						data: {}
					}
				]
			},
			favoriteOverlays: ['2']
		}
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer, [overlaysFeatureKey]: OverlayReducer }),
				RouterTestingModule
			],
			providers: [
				CasesEffects,
				StorageService,
				CasesService,
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => Observable.throw(null) }
				},
				provideMockActions(() => actions),
				{ provide: LoggerService, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: casesConfig, useValue: { schema: null, defaultCase: { id: 'defaultCaseId' } } },
				{ provide: OverlaysConfig, useValue: {} },
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([LoggerService], (_loggerService: LoggerService) => {
		loggerService = _loggerService;
	}));

	beforeEach(inject([CasesEffects, CasesService], (_casesEffects: CasesEffects, _casesService: CasesService) => {
		casesEffects = _casesEffects;
		casesService = _casesService;
	}));

	it('should be defined', () => {
		expect(casesEffects).toBeDefined();
	});

	it('loadCases$ should call casesService.loadCases with case lastId from state, and return LoadCasesSuccessAction', () => {
		let loadedCases: Case[] = [{ ...caseMock, id: 'loadedCase1' }, {
			...caseMock,
			id: 'loadedCase2'
		}, { ...caseMock, id: 'loadedCase1' }];
		spyOn(casesService, 'loadCases').and.callFake(() => Observable.of(loadedCases));
		actions = hot('--a--', { a: new LoadCasesAction() });
		const expectedResults = cold('--b--', { b: new AddCasesAction(loadedCases) });
		expect(casesEffects.loadCases$).toBeObservable(expectedResults);
	});

	it('onAddCase$ should call casesService.createCase with action.payload(new case), and return AddCaseSuccessAction', () => {
		let newCasePayload: Case = { ...caseMock, id: 'newCaseId', name: 'newCaseName' };
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
		const updatedCase: Case = { ...caseMock, id: 'updatedCaseId' };
		actions = hot('--a--', { a: new UpdateCaseAction(updatedCase) });
		const expectedResults = cold('--b--', { b: new UpdateCaseBackendAction(updatedCase) });
		expect(casesEffects.onUpdateCase$).toBeObservable(expectedResults);
	});

	it('loadDefaultCase$ should call updateCaseViaQueryParmas and dispatch SelectCaseAction ', () => {
		spyOnProperty(casesService, 'defaultCase', 'get').and.returnValue({ id: '31b33526-6447-495f-8b52-83be3f6b55bd' } as any);
		spyOn(casesService.queryParamsHelper, 'updateCaseViaQueryParmas')
			.and
			.returnValue('updateCaseViaQueryParmasResult');
		const queryParmas: Params = { foo: 'bar' };
		actions = hot('--a--', { a: new LoadDefaultCaseAction(queryParmas) });
		const expectedResults = cold('--b--', { b: new SelectCaseAction('updateCaseViaQueryParmasResult' as any) });
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
