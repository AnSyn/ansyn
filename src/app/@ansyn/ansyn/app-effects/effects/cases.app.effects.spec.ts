import { async, inject, TestBed } from '@angular/core/testing';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer
} from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { CasesAppEffects } from './cases.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import {
	MapFacadeService,
	mapFeatureKey,
	MapReducer,
	SetActiveMapId,
	SetMapsDataActionStore,
	SetToastMessageAction,
	UpdateMapAction
} from '@ansyn/map-facade';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { GetProvidersMapsService, ImageryCommunicatorService } from '@ansyn/imagery';
import { CoreConfig } from '../../modules/core/models/core.config';
import { ErrorHandlerService } from '../../modules/core/services/error-handler.service';
import { StorageService } from '../../modules/core/services/storage/storage.service';
import {
	LoadDefaultCaseIfNoActiveCaseAction,
	SelectCaseAction,
	SelectDilutedCaseAction
} from '../../modules/menu-items/cases/actions/cases.actions';
import { casesConfig, CasesService } from '../../modules/menu-items/cases/services/cases.service';
import { casesFeatureKey, CasesReducer } from '../../modules/menu-items/cases/reducers/cases.reducer';
import { toolsConfig } from '../../modules/menu-items/tools/models/tools-config';
import { OverlayReducer, overlaysFeatureKey } from '../../modules/overlays/reducers/overlays.reducer';
import {
	DisplayOverlayAction,
	DisplayOverlaySuccessAction,
	LoadOverlaysSuccessAction
} from '../../modules/overlays/actions/overlays.actions';
import { IOverlayByIdMetaData, OverlaysService } from '../../modules/overlays/services/overlays.service';
import { ICase } from '../../modules/menu-items/cases/models/case.model';
import { GeoRegisteration, IOverlay } from '../../modules/overlays/models/overlay.model';
import { overlayStatusConfig } from "../../modules/overlays/overlay-status/config/overlay-status-config";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
					[mapFeatureKey]: MapReducer,
					[overlayStatusFeatureKey]: OverlayStatusReducer
				}),
				TranslateModule,
				RouterTestingModule
			],
			providers: [
				{
					provide: TranslateService,
					useValue: {}
				},
				{ provide: casesConfig, useValue: { schema: null, defaultCase: { id: 'defaultCaseId' } } },
				{
					provide: overlayStatusConfig,
					useValue: {
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
				},
				{
					provide: OverlaysService,
					useValue: {
						getOverlayById: (id: string) => {
							if (['uuu', 'eee'].includes(id)) {
								const overlay = <IOverlay>{};
								overlay.id = id;

								return of(overlay);
							}

							return throwError(new HttpErrorResponse({ status: 404 }));
						},

						getOverlaysById: (ids: IOverlayByIdMetaData[]) => {
							if (ids.every(({ id }) => ['uuu', 'eee'].includes(id))) {
								return of(ids);
							}

							return throwError(new HttpErrorResponse({ status: 404 }));
						}

					}
				},
				ImageryCommunicatorService,
				CasesAppEffects,
				{ provide: CoreConfig, useValue: {} },
				{ provide: StorageService, useValue: {} },
				CasesService,
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
				},
				provideMockActions(() => actions),
				{ provide: casesConfig, useValue: { schema: null } },
				{
					provide: toolsConfig, useValue: {}
				},
				{
					provide: GetProvidersMapsService,
					useValue: {
						getDefaultProviderByType: () => of()
					}
				}
			]
		}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService, Store, casesConfig],
		(_imageryCommunicatorService: ImageryCommunicatorService, _store: Store<any>) => {
			imageryCommunicatorService = _imageryCommunicatorService;
			store = _store;
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
		const overlay = <IOverlay>{ id: 'tmp' };
		store.dispatch(new SetMapsDataActionStore({ mapsList }));
		store.dispatch(new SetActiveMapId(activeMapId));
		const action = new DisplayOverlaySuccessAction({ overlay, mapId: 'map1' });
		actions = hot('--a--', { a: action });
		const activeMap = MapFacadeService.mapById(mapsList, activeMapId);
		const expectedResults = cold('--b--', {
			b: new UpdateMapAction({
				id: activeMapId, changes: {
					data: {
						...activeMap.data,
						overlay,
						isAutoImageProcessingActive: false,
						imageManualProcessArgs: casesAppEffects.defaultImageManualProcessArgs
					}
				}
			})
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
				presetOverlays: [],
				miscOverlays: {},
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
			spyOn(casesService, 'loadCase').and.callFake(() => of(caseItem));
			actions = hot('--a--', { a: new SelectDilutedCaseAction(<any>caseItem) });
			const expectedResults = cold('--(bc)--', {
				b: new SetToastMessageAction({
					toastText: 'Failed to load case (404)',
					showWarningIcon: true,
					originalMessage: 'Http failure response for (unknown url): 404 undefined'
				}),
				c: new LoadDefaultCaseIfNoActiveCaseAction()
			});
			expect(casesAppEffects.loadCase$).toBeObservable(expectedResults);
		});

		it('loadCase$ should dispatch SelectCaseAction if all case and all its overlays exists', () => {
			const caseItem: ICase = caseMock2;
			let overlays = [{id: 'eee', sourceType: 'PLANET', name: 'name', photoTime: 'photoTime', date: new Date(), azimuth: 0, isGeoRegistered: GeoRegisteration.geoRegistered },
				{id: 'uuu', sourceType: 'PLANET', name: 'favorite', photoTime: 'photoTime', date: new Date(), azimuth: 0, isGeoRegistered: GeoRegisteration.geoRegistered }]
			actions = hot('--a--', { a: new SelectDilutedCaseAction(<any>caseItem) });
			spyOn(overlaysService, 'getOverlaysById').and.callFake(() => of(overlays));
			const parsedCase: ICase = casesAppEffects.getFullOverlays(caseItem, new Map(overlays.map(overlay => [overlay.id, overlay])));
			const expectedResults = cold('--(bc)--', {
				b: new SelectCaseAction(parsedCase),
				c: new DisplayOverlayAction({overlay: overlays[0], mapId: parsedCase.state.maps.data[0].id})
			});
			expect(casesAppEffects.loadCase$).toBeObservable(expectedResults);
		});
	});

});
