import { LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { BeginLayerTreeLoadAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { LayersAppEffects } from './layers.app.effects';
import { StoreModule } from '@ngrx/store';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';

describe('LayersAppEffects', () => {
	let layersAppEffects: LayersAppEffects;
	let effectsRunner: EffectsRunner;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [EffectsTestingModule, StoreModule.forRoot({ layers: LayersReducer })],
			providers: [LayersAppEffects]

		}).compileComponents();
	}));

	beforeEach(inject([LayersAppEffects, EffectsRunner], (_layersAppEffects: LayersAppEffects, _effectsRunner: EffectsRunner) => {
		layersAppEffects = _layersAppEffects;
		effectsRunner = _effectsRunner;
	}));


	it('selectCase$', () => {
		let selectedCase = { id: 'asdfasdf' } as Case;

		effectsRunner.queue(new SelectCaseAction(selectedCase));
		let result: BeginLayerTreeLoadAction;
		layersAppEffects.selectCase$.subscribe((_result: BeginLayerTreeLoadAction) => {
			result = _result;
		});

		expect(result instanceof BeginLayerTreeLoadAction).toBeTruthy();
		expect(result.payload).toEqual({ caseId: selectedCase.id });
	});

});
