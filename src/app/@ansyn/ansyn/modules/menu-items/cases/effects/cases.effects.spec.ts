import { HttpClientModule } from '@angular/common/http';
import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { CoreConfig } from '../../../core/models/core.config';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoggerService } from '../../../core/services/logger.service';
import { StorageService } from '../../../core/services/storage/storage.service';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer
} from '../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { LayerType } from '../../layers-manager/models/layers.model';
import { selectLayers } from '../../layers-manager/reducers/layers.reducer';
import { DataLayersService, layersConfig } from '../../layers-manager/services/data-layers.service';
import {
	AddCasesAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SelectDilutedCaseAction
} from '../actions/cases.actions';
import { ICase } from '../models/case.model';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	initialCasesState,
	selectMyCasesTotal,
	selectSelectedCase
} from '../reducers/cases.reducer';
import { casesConfig, CasesService } from '../services/cases.service';
import { CasesEffects } from './cases.effects';
import { selectActiveMapId, selectMapsIds } from '@ansyn/map-facade';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CasesType } from '../models/cases-config';

describe('CasesEffects', () => {
	let casesEffects: CasesEffects;
	let casesService: CasesService;
	let loggerService: LoggerService;
	let dataLayersService: DataLayersService;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesState = { ...initialCasesState };

	const caseMock: ICase = {
		id: 'case1',
		name: 'name',
		owner: 'user',
		creationTime: new Date(),
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
				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[overlayStatusFeatureKey]: OverlayStatusReducer
				}),
				TranslateModule,
				RouterTestingModule
			],
			providers: [
				CasesEffects,
				{ provide: StorageService, useValue: {} },
				CasesService,
				DataLayersService,
				{ provide: layersConfig, useValue: {} },
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
				},
				{
					provide: TranslateService,
					useValue: {}
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
		const fakeStore = new Map<any, any>([
			[selectLayers, [{ type: LayerType.annotation }]],
			[casesStateSelector, casesState],
			[selectSelectedCase, { id: 'delete-case-id' }],
			[selectActiveMapId, 'mapId'],
			[selectMapsIds, 'mapIds[]'],
			[selectMyCasesTotal, 0]
		]);
		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
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

	it('loadCases$ should call casesService.loadCases with offset and call AddCasesAction with this cases', () => {
		let loadedCases: ICase[] = [{ ...caseMock, id: 'loadedCase1' }, {
			...caseMock,
			id: 'loadedCase2'
		}, { ...caseMock, id: 'loadedCase3' }];
		spyOn(casesService, 'loadCases').and.callFake(() => of(loadedCases));
		actions = hot('--a--', { a: new LoadCasesAction() });
		const expectedResults = cold('--b--', { b: new AddCasesAction({cases: loadedCases, type: CasesType.MyCases}) });
		expect(casesEffects.loadCases$).toBeObservable(expectedResults);
	});

	it('onSaveCaseAs$ should add a default case', () => {
		const selectedCase = {
			id: 'selectedCaseId',
			selectedContextId: 'selectedContextId',
			state: {
				maps: {
					activeMapId: 'active',
					data: [{id: 'active'}]
				},
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

	/*it('onSaveCaseAsSuccess$ should set auto save with "true" and update map', () => {
		actions = hot('--a--', { a: new SaveCaseAsSuccessAction(<any>{ state: { maps: { data: [] } } }) });
		const expectedResults = cold('--(bc)--', {
			b: new SetAutoSave(true),
			c: new SetMapsDataActionStore({ mapsList: [] })
		});
		expect(casesEffects.onSaveCaseAsSuccess$).toBeObservable(expectedResults);
	});*/

	describe('loadCase$', () => {
		it('should load the given case', () => {
			const myCaseId = 'myCaseId';
			const caseToLoad: ICase = { ...caseMock, id: myCaseId };
			spyOn(casesService, 'loadCase').and.returnValue(of(caseToLoad));
			actions = hot('--a--', { a: new LoadCaseAction(myCaseId) });
			const expectedResults = cold('--(bc)--', { b: new SelectDilutedCaseAction(caseToLoad), c: new LoadCasesAction(CasesType.MySharedCases, true) });
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
