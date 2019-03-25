import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import {
	DisplayOverlaySuccessAction,
	LoadOverlaysSuccessAction,
	OverlayReducer,
	overlaysFeatureKey,
	OverlaysService
} from '../../modules/overlays/public_api';
import {
	CoreConfig,
	ErrorHandlerService,
	ICase,
	IOverlay,
	SetToastMessageAction,
	StorageService,
} from '@ansyn/core';
import { MapFacadeService, SetMapsDataActionStore, UpdateMapAction, SetActiveMapId, mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import {
	AddCaseAction,
	casesConfig,
	casesFeatureKey,
	CasesReducer,
	CasesService,
	LoadDefaultCaseIfNoActiveCaseAction,
	SelectCaseAction,
	SelectDilutedCaseAction, toolsConfig
} from '../../modules/menu-items/public_api';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { IOverlayByIdMetaData } from '../../modules/overlays/public_api';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let actions: Observable<any>;
	let overlaysService: OverlaysService;
	let casesService: CasesService;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	const selectedCase: ICase = {
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

				StoreModule.forRoot({
					[overlaysFeatureKey]: OverlayReducer,
					[casesFeatureKey]: CasesReducer,
					[mapFeatureKey]: MapReducer
				}),
				RouterTestingModule
			],
			providers: [
				{
					provide: OverlaysService,
					useValue: {
						getOverlayById: (id: string) => {
							if (['uuu', 'eee'].includes(id)) {
								const overlay = <IOverlay> {};
								overlay.id = id;

								return of(overlay);
							}

							return throwError(new HttpErrorResponse({ status: 404 }));
						},

						getOverlaysById: (ids: IOverlayByIdMetaData[]) => {
							if (ids.every(({ id }) => ['uuu', 'eee'].includes(id))) {
								const overlay = <IOverlay> {};
								return of([overlay]);
							}

							return throwError(new HttpErrorResponse({ status: 404 }));
						},

					}
				},
				ImageryCommunicatorService,
				CasesAppEffects,
				{ provide: CoreConfig, useValue: {} },
				{ provide: StorageService, useValue: {}},
				CasesService,
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
				},
				provideMockActions(() => actions),
				{ provide: casesConfig, useValue: { schema: null } },
				{
					provide: toolsConfig, useValue: {
						ImageProcParams:
							[
								{
									name: 'Sharpness',
									defaultValue: 0,
									min: 0,
									max: 100
								},
								{
									name: 'Contrast',
									defaultValue: 0,
									min: -100,
									max: 100
								},
								{
									name: 'Brightness',
									defaultValue: 100,
									min: -100,
									max: 100
								},
								{
									name: 'Gamma',
									defaultValue: 100,
									min: 1,
									max: 200
								},
								{
									name: 'Saturation',
									defaultValue: 0,
									min: 1,
									max: 100
								}
							]
					}
				}
			]
		}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService, Store, casesConfig],
		(_imageryCommunicatorService: ImageryCommunicatorService, _store: Store<any>) => {
			imageryCommunicatorService = _imageryCommunicatorService;
			store = _store;
			store.dispatch(new AddCaseAction(selectedCase));
			store.dispatch(new SelectCaseAction(selectedCase));
			store.dispatch(new LoadOverlaysSuccessAction([{
				id: 'tmp',
				name: 'tmp',
				imageUrl: 'tmp',
				sourceType: 'tmp'
			}] as any));
		}));

	beforeEach(inject([CasesAppEffects, CasesService, OverlaysService], (_casesAppEffects: CasesAppEffects, _casesService: CasesService, _overlaysService: OverlaysService) => {
		casesAppEffects = _casesAppEffects;
		casesService = _casesService;
		overlaysService = _overlaysService;
	}));

	it('Effect : onDisplayOverlay$ - with the active map id ', () => {
		const mapsList: any[] = [{ id: 'map1', data: {} }, { id: 'map2', data: {} }];
		const activeMapId = 'map1';
		const overlay = <IOverlay> { id: 'tmp' };
		store.dispatch(new SetMapsDataActionStore({ mapsList }));
		store.dispatch(new SetActiveMapId(activeMapId));
		const action = new DisplayOverlaySuccessAction({ overlay, mapId: 'map1' });
		actions = hot('--a--', { a: action });
		const activeMap = MapFacadeService.mapById(mapsList, activeMapId);
		const expectedResults = cold('--b--', { b: new UpdateMapAction({ id: activeMapId, changes: {
			data: {
				...activeMap.data,
				overlay,
				isAutoImageProcessingActive: false,
				imageManualProcessArgs: casesAppEffects.defaultImageManualProcessArgs
			} }})
		});
		expect(casesAppEffects.onDisplayOverlay$).toBeObservable(expectedResults);
	});

	describe('loadCase$', () => {
		const caseMock2: ICase = {
			id: 'fakeId',
			name: 'fakeName',
			owner: 'owner',
			creationTime: new Date(),
			lastModified: new Date(),
			autoSave: false,
			state: {
				favoriteOverlays: [
					{
						id: 'uuu',
						sourceType: 'PLANET'
					}
				],
				time: {
					type: 'absolute',
					from: new Date(),
					to: new Date()
				},
				orientation: 'Align North',
				dataInputFilters: { filters: [], active: true },
				timeFilter: 'Start - End',
				region: {},
				maps: {
					layout: 'layout1',
					activeMapId: 'activeMapId',
					data: [
						{
							id: 'activeMapId',
							data: {
								overlay: {
									id: 'eee',
									sourceType: 'PLANET'
								}
							}
						}
					]
				},
				overlaysManualProcessArgs: {}
			} as any
		};

		it('loadCase$ should dispatch LoadDefaultCaseIfNoActiveCaseAction and SetToastMessageAction when there is a loading error', () => {
			const caseItem: any = {
				...caseMock2,
				state: { ...caseMock2.state, favoriteOverlays: [{ id: 'blabla', sourceType: 'PLANET' }] }
			};
			store.dispatch(new AddCaseAction(caseItem));
			spyOn(casesService, 'loadCase').and.callFake(() => of(caseItem));
			actions = hot('--a--', { a: new SelectDilutedCaseAction(<any> caseItem) });
			const expectedResults = cold('--(bc)--', {
				b: new SetToastMessageAction({ toastText: 'Failed to load case (404)', showWarningIcon: true }),
				c: new LoadDefaultCaseIfNoActiveCaseAction()
			});
			expect(casesAppEffects.loadCase$).toBeObservable(expectedResults);
		});

		it('loadCase$ should dispatch SelectCaseAction if all case and all its overlays exists', () => {
			const caseItem: ICase = caseMock2;
			store.dispatch(new AddCaseAction(caseItem));
			spyOn(casesService, 'loadCase').and.callFake(() => of(caseItem));
			actions = hot('--a--', { a: new SelectDilutedCaseAction(<any> caseItem) });
			const expectedResults = cold('--(b)--', {
				b: new SelectCaseAction(caseItem)
			});
			expect(casesAppEffects.loadCase$).toBeObservable(expectedResults);
		});
	});

});
