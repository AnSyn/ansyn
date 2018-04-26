import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { casesConfig, CasesReducer, CasesService } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { OverlayReducer } from '@ansyn/overlays';
import { RouterTestingModule } from '@angular/router/testing';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { ContextModule } from '@ansyn/context/context.module';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { HttpClientModule } from '@angular/common/http';
import { AddCaseAction, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';
import { overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { casesFeatureKey } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { contextFeatureKey, ContextReducer } from '@ansyn/context/reducers/context.reducer';
import { ContextService } from '@ansyn/context/services/context.service';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { ContextConfig } from '@ansyn/context/models/context.config';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let actions: Observable<any>;
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

	beforeEach(inject([CasesAppEffects, CasesService], (_casesAppEffects: CasesAppEffects, _casesService: CasesService) => {
		casesAppEffects = _casesAppEffects;
		casesService = _casesService;
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

});
