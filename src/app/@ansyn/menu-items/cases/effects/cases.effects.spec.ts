import { CasesEffects } from './cases.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { casesConfig, CasesService } from '../services/cases.service';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '../reducers/cases.reducer';
import {
	AddCaseAction,
	AddCasesAction, LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction, SelectDilutedCaseAction,
	UpdateCaseAction,
	UpdateCaseBackendAction
} from '../actions/cases.actions';
import { Observable, of, throwError } from 'rxjs';
import { CoreConfig, ErrorHandlerService, ICase, LoggerService, StorageService } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { Params } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { DataLayersService, layersConfig } from '../../layers-manager/services/data-layers.service';
import { LayerType } from '../../layers-manager/models/layers.model';

describe('AlgorithmsEffects', () => {
	let casesEffects: CasesEffects;
	let casesService: CasesService;
	let loggerService: LoggerService;
	let dataLayersService: DataLayersService;
	let actions: Observable<any>;
	let store: Store<any>;

	const caseMock: ICase = {
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
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				RouterTestingModule
			],
			providers: [
				CasesEffects,
				StorageService,
				CasesService,
				DataLayersService,
				{ provide: layersConfig, useValue: {} },
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
				},
				provideMockActions(() => actions),
				{ provide: LoggerService, useValue: {} },
				{ provide: casesConfig, useValue: { schema: null, defaultCase: { id: 'defaultCaseId' } } },
				{ provide: CoreConfig, useValue: { storageService: { baseUrl: 'fake-base-url' } } }
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		let selectLayersState =
			[
				{ type: LayerType.annotation }
			];


		spyOn(store, 'select').and.callFake(() => of(selectLayersState));
	}));

	beforeEach(inject([DataLayersService], (_dataLayersService: DataLayersService) => {
		dataLayersService = _dataLayersService;
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
		let loadedCases: ICase[] = [{ ...caseMock, id: 'loadedCase1' }, {
			...caseMock,
			id: 'loadedCase2'
		}, { ...caseMock, id: 'loadedCase1' }];
		spyOn(casesService, 'loadCases').and.callFake(() => of(loadedCases));
		actions = hot('--a--', { a: new LoadCasesAction() });
		const expectedResults = cold('--b--', { b: new AddCasesAction(loadedCases) });
		expect(casesEffects.loadCases$).toBeObservable(expectedResults);
	});

	it('onAddCase$ should call casesService.createCase with action.payload(new case), and return AddCaseSuccessAction', () => {
		let newCasePayload: ICase = { ...caseMock, id: 'newCaseId', name: 'newCaseName' };
		spyOn(casesService, 'createCase').and.callFake(() => of(newCasePayload));
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
		const updatedCase: ICase = { ...caseMock, id: 'updatedCaseId' };
		actions = hot('--a--', { a: new UpdateCaseAction({ updatedCase: updatedCase, forceUpdate: true }) });
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
		const selectedCase = {
			id: 'selectedCaseId',
			selectedContextId: 'selectedContextId',
			state: {
				layers: {
					activeLayersIds: [
						'111',
						'222'
					]
				}
			}
		} as ICase;

		let serverResponse = [
			{
				id: 'caseId',
				name: 'caseId',
				type: 'Static',
				dataLayers: [
					{
						'id': 'layerId_1234',
						'name': 'New York Roads',
						'isChecked': true
					}
				]
			}
		];

		spyOn(dataLayersService, 'addLayer').and.returnValue(of(serverResponse));
		spyOn(casesService, 'createCase').and.callFake(() => of(selectedCase));
		actions = hot('--a--', { a: new SaveCaseAsAction(selectedCase) });
		const expectedResults = cold('--b--', { b: new SaveCaseAsSuccessAction(selectedCase) });
		expect(casesEffects.onSaveCaseAs$).toBeObservable(expectedResults);
	});

	describe('loadCase$', () => {
		it('should load the given case', () => {
			const myCaseId = 'myCaseId';
			const caseToLoad: ICase = { ...caseMock, id: myCaseId };
			spyOn(casesService, 'loadCase').and.returnValue(of(caseToLoad));
			actions = hot('--a--', { a: new LoadCaseAction(myCaseId) });
			const expectedResults = cold('--b--', { b: new SelectDilutedCaseAction(caseToLoad) });
			expect(casesEffects.loadCase$).toBeObservable(expectedResults);
		});
		it('should load the default case, if the given case fails to load', () => {
			const myCaseId = 'myCaseId';
			spyOn(casesService, 'loadCase').and.throwError('');
			actions = hot('--a--', { a: new LoadCaseAction(myCaseId) });
			const expectedResults = cold('--(b|)', { b: new LoadDefaultCaseAction() });
			expect(casesEffects.loadCase$).toBeObservable(expectedResults);
		});
	});

});
