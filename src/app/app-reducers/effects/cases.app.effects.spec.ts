import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import {
	AddCaseAction,
	AddCaseSuccessAction,
	casesConfig,
	CasesReducer,
	CasesService,
	SaveDefaultCaseAction,
	SelectCaseByIdAction
} from '@ansyn/menu-items/cases';
import { HttpModule } from '@angular/http';
import { Action, Store, StoreModule } from '@ngrx/store';
import { OverlayReducer } from '@ansyn/overlays';
import { ICasesState } from '@ansyn//menu-items/cases';
import { CoreModule } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DisplayOverlayAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ContextProviderService } from '@ansyn/context/providers/context-provider.service';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { FiltersActionTypes } from '@ansyn/menu-items/filters/actions/filters.actions';
import { BaseContextSourceProvider } from '@ansyn/context/context.interface';
import { ContextElasticSource } from '../../app-providers/context-source-providers/context-elastic-source.service';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { MapReducer } from '@ansyn/map-facade/reducers/map.reducer';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let effectsRunner: EffectsRunner;
	let casesService: CasesService;
	let store: Store<any>;
	let icase_state: ICasesState;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({ overlays: OverlayReducer, cases: CasesReducer, map: MapReducer }),
				CoreModule,
				RouterTestingModule
			],
			providers: [CasesAppEffects,
				CasesService,
				{provide: casesConfig, useValue: {baseUrl: null}},
				// Provide context provider
				{ provide: BaseContextSourceProvider, useClass: ContextElasticSource },
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, casesConfig], (_store: Store<any>, casesConfig: any) => {
		store = _store;

		icase_state = {
			cases: [{
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
			}],
			selected_case: {
				id: 'case1',
				index: 0

			},
			default_case: {
				id: 'case1',
				state: {
					selected_overlays_ids: []
				}
			}
		} as any;

		store.dispatch(new AddCaseSuccessAction(icase_state.cases[0]));
		store.dispatch(new SelectCaseByIdAction(icase_state.selected_case.id));
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
		effectsRunner.queue(new SelectCaseByIdAction(icase_state.selected_case.id));
		let count = 0;
		casesAppEffects.setShowFavoritesFlagOnFilters$.subscribe((result: Action) => {
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


	it('saveDefaultCase$ should add a default case', () => {
		effectsRunner.queue(new SaveDefaultCaseAction(icase_state.default_case));

		casesAppEffects.saveDefaultCase$.subscribe((result: AddCaseAction) => {
			expect(result instanceof AddCaseAction).toBeTruthy();
			expect(result.payload).toEqual(icase_state.default_case);
		});
	});

});
