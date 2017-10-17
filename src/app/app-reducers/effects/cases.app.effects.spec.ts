import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { AddCaseSuccessAction, casesConfig, CasesReducer, CasesService } from '@ansyn/menu-items/cases';
import { Action, Store, StoreModule } from '@ngrx/store';
import { OverlayReducer } from '@ansyn/overlays';
import { CoreModule } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { FiltersActionTypes } from '@ansyn/menu-items/filters/actions/filters.actions';
import { BaseContextSourceProvider } from '@ansyn/context/context.interface';
import { ContextModule } from '@ansyn/context/context.module';
import { ContextTestSourceService } from '@ansyn/context/providers/context-test-source.service';
import { MOCK_TEST_CONFIG } from '@ansyn/context/providers/context-test-source.service.spec';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { HttpClientModule } from '@angular/common/http';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/actions/filters.actions';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let effectsRunner: EffectsRunner;
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
				EffectsTestingModule,
				StoreModule.forRoot({ overlays: OverlayReducer, cases: CasesReducer, map: MapReducer }),
				CoreModule,
				RouterTestingModule,
				ContextModule.forRoot(MOCK_TEST_CONFIG)
			],
			providers: [CasesAppEffects,
				CasesService,
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

	beforeEach(inject([CasesAppEffects, EffectsRunner, CasesService], (_casesAppEffects: CasesAppEffects, _effectsRunner: EffectsRunner, _casesService: CasesService) => {
		casesAppEffects = _casesAppEffects;
		effectsRunner = _effectsRunner;
		casesService = _casesService;
	}));

	it('setShowFavoritesFlagOnFilters$', () => {
		effectsRunner.queue(new SelectCaseAction(selectedCase));
		let count = 0;
		casesAppEffects.setShowFavoritesFlagOnFilters$.subscribe((result: EnableOnlyFavoritesSelectionAction) => {
			expect(result.type).toBe(FiltersActionTypes.ENABLE_ONLY_FAVORITES_SELECTION);
			expect(result.payload).toBe(true);
			count++;
		});
		expect(count).toBe(1);
	});


	it('Effect : onDisplayOverlay$ - with the active map id ', () => {
		const mapsList: any[] = [{ id: 'map1', data: {} }, { id: 'map2', data: {} }];
		const activeMapId = 'map1';
		store.dispatch(new SetMapsDataActionStore({ mapsList, activeMapId }));
		const action = new DisplayOverlayAction({ overlay: <Overlay> { id: 'tmp' } });
		effectsRunner.queue(action);
		let result: SetMapsDataActionStore;
		casesAppEffects.onDisplayOverlay$.subscribe((_result: SetMapsDataActionStore) => {
			result = _result;
		});
		expect(result.constructor).toEqual(SetMapsDataActionStore);
		expect(MapFacadeService.activeMap(<any>{ ...result.payload, activeMapId }).data.overlay.id).toEqual('tmp');
	});


});
