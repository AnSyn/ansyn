import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { AddCaseSuccessAction, casesConfig, CasesReducer, CasesService } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { OverlayReducer } from '@ansyn/overlays';
import { CoreModule } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { BaseContextSourceProvider } from '@ansyn/context/context.interface';
import { ContextModule } from '@ansyn/context/context.module';
import { ContextTestSourceService } from '@ansyn/context/providers/context-test-source.service';
import { MOCK_TEST_CONFIG } from '@ansyn/context/providers/context-test-source.service.spec';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { HttpClientModule } from '@angular/common/http';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let actions: Observable<any>;
	let casesService: CasesService;
	let store: Store<any>;
	const selectedCase: Case = {
		id: 'case1',
		state: {
			maps: {
				active_map_id: '5555',
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
			favoritesOverlays: ['2']
		}
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,

				StoreModule.forRoot({ overlays: OverlayReducer, cases: CasesReducer, map: MapReducer }),
				CoreModule,
				RouterTestingModule,
				ContextModule.forRoot(MOCK_TEST_CONFIG)
			],
			providers: [CasesAppEffects,
				CasesService,
				provideMockActions(() => actions),
				{ provide: casesConfig, useValue: { baseUrl: null } },
				// Provide context provider
				{ provide: BaseContextSourceProvider, useClass: ContextTestSourceService },
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, casesConfig], (_store: Store<any>, casesConfig: any) => {
		store = _store;
		store.dispatch(new AddCaseSuccessAction(selectedCase));
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

	it('setShowFavoritesFlagOnFilters$', () => {
		actions = hot('--a--', { a: new SelectCaseAction(selectedCase) });
		const expectedResults = cold('--b--', { b: new EnableOnlyFavoritesSelectionAction(true) });
		expect(casesAppEffects.setShowFavoritesFlagOnFilters$).toBeObservable(expectedResults);
	});


	it('Effect : onDisplayOverlay$ - with the active map id ', () => {
		const mapsList: any[] = [{ id: 'map1', data: {} }, { id: 'map2', data: {} }];
		const activeMapId = 'map1';
		const overlay = <Overlay> { id: 'tmp' };
		store.dispatch(new SetMapsDataActionStore({ mapsList, activeMapId }));
		const action = new DisplayOverlayAction({ overlay });
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
