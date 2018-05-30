import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { ContextModule } from '@ansyn/context/context.module';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import {
	AddCaseAction,
	LoadCaseAction,
	LoadDefaultCaseIfNoActiveCaseAction,
	SelectCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case, CaseGeoFilter } from '@ansyn/core/models/case.model';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';
import { OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { contextFeatureKey, ContextReducer } from '@ansyn/context/reducers/context.reducer';
import { ContextService } from '@ansyn/context/services/context.service';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { ContextConfig } from '@ansyn/context/models/context.config';
import { casesConfig, CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { CasesEffects } from '@ansyn/menu-items/cases/effects/cases.effects';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let actions: Observable<any>;
	let overlaysService: OverlaysService;
	let casesService: CasesService;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	const selectedCase: Case = {
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
					[contextFeatureKey]: ContextReducer,
					[mapFeatureKey]: MapReducer
				}),
				RouterTestingModule,
				ContextModule
			],
			providers: [
				{
					provide: ContextService,
					useValue: {
						loadContexts: () => Observable.of([])
					}
				},
				{
					provide: OverlaysService,
					useValue: {
						getOverlayById: (id: string) => {
							if (['uuu', 'eee'].includes(id)) {
								const overlay = new Overlay();
								overlay.id = id;

								return Observable.of(overlay);
							}

							throw new HttpErrorResponse({ status: 404 });
						}
					}
				},
				ImageryCommunicatorService,
				CasesAppEffects,
				{ provide: CoreConfig, useValue: {} },
				StorageService,
				CasesService,
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => Observable.throw(null) }
				},
				{
					provide: ContextConfig,
					useValue: {}
				},
				provideMockActions(() => actions),
				{ provide: casesConfig, useValue: { schema: null } }
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
		const overlay = <Overlay> { id: 'tmp' };
		store.dispatch(new SetMapsDataActionStore({ mapsList, activeMapId }));
		const action = new DisplayOverlayAction({ overlay, mapId: "map1"});
		actions = hot('--a--', { a: action });
		const updatedMapsList = [...mapsList];
		updatedMapsList.forEach((map) => {
			if (map.id === activeMapId) {
				map.data.overlay = overlay;
			}
		});
		const expectedResults = cold('--b--', { b: new SetMapsDataActionStore({ mapsList: updatedMapsList }) });
		expect(casesAppEffects.onDisplayOverlay$).toBeObservable(expectedResults);
	});

	describe('loadCase$', () => {
		const caseMock2: Case = {
			id: 'fakeId',
			name: 'fakeName',
			owner: 'owner',
			creationTime: new Date(),
			lastModified: new Date(),
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
				geoFilter: CaseGeoFilter.PinPoint,
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
			const caseItem: any = { ...caseMock2, state: { ...caseMock2.state, favoriteOverlays: [ { id: 'blabla', sourceType: 'PLANET' } ] } };
			store.dispatch(new AddCaseAction(caseItem));
			spyOn(casesService, 'loadCase').and.callFake(() => Observable.of(caseItem));
			actions = hot('--a--', { a: new LoadCaseAction(caseItem.id) });
			const expectedResults = cold('--(bc|)', {
				b: new SetToastMessageAction({ toastText: 'Failed to load case (404)', showWarningIcon: true }),
				c: new LoadDefaultCaseIfNoActiveCaseAction()
			});
			expect(casesAppEffects.loadCase$).toBeObservable(expectedResults);
		});

		it('loadCase$ should dispatch SelectCaseAction if all case and all its overlays exists', () => {
			const caseItem: Case = caseMock2;
			store.dispatch(new AddCaseAction(caseItem));
			spyOn(casesService, 'loadCase').and.callFake(() => Observable.of(caseItem));
			actions = hot('--a--', { a: new LoadCaseAction(caseItem.id) });
			const expectedResults = cold('--(b)--', {
				b: new SelectCaseAction(caseItem)
			});
			expect(casesAppEffects.loadCase$).toBeObservable(expectedResults);
		});
	});

});
