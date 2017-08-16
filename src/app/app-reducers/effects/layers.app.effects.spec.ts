import { LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { LayerTreeLoadedAction } from '@ansyn/menu-items/layers-manager';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { LayersAppEffects } from './layers.app.effects';
import { Action, Store, StoreModule } from '@ngrx/store';
import { CasesReducer, ICasesState, AddCaseSuccessAction, SelectCaseByIdAction } from '@ansyn/menu-items/cases';
import { AddMapInstacneAction } from '@ansyn/map-facade';

describe('LayersAppEffects', () => {
	let layersAppEffects: LayersAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let icase_state: ICasesState;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [EffectsTestingModule, StoreModule.provideStore({ layers: LayersReducer, cases: CasesReducer })],
			providers: [LayersAppEffects]

		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
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
					dataLayers: [{
						"id": "25a6362b-5b4c-45a0-9b7a-17a0fda04c59",
						"name": "OSM",
						"type": "Static",
						"isChecked": false,
						"children": []
					}]
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
	}));

	beforeEach(inject([LayersAppEffects, EffectsRunner], (_layersAppEffects: LayersAppEffects, _effectsRunner: EffectsRunner) => {
		layersAppEffects = _layersAppEffects;
		effectsRunner = _effectsRunner;
	}));


	it('addMapInstance$', () => {
		effectsRunner.queue(new AddMapInstacneAction(null));

		let result: LayerTreeLoadedAction;
		layersAppEffects.addMapInstance$.subscribe((_result: LayerTreeLoadedAction) => {
			result = _result;
		});

		expect(result instanceof LayerTreeLoadedAction).toBeTruthy();
		expect(result.payload).toEqual({ layers: icase_state.cases[0].state.dataLayers });
	});

	it('updateCaseOnSelectionChange$', () => {
		expect(true).toEqual(false);
	});

});
