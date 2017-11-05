import { layersFeatureKey, LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { BeginLayerTreeLoadAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';

import { async, inject, TestBed } from '@angular/core/testing';
import { LayersAppEffects } from './layers.app.effects';
import { StoreModule } from '@ngrx/store';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';

describe('LayersAppEffects', () => {
	let layersAppEffects: LayersAppEffects;
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })],
			providers: [
				provideMockActions(() => actions),
				LayersAppEffects
			]

		}).compileComponents();
	}));

	beforeEach(inject([LayersAppEffects], (_layersAppEffects: LayersAppEffects) => {
		layersAppEffects = _layersAppEffects;
	}));


	it('selectCase$', () => {
		let selectedCase = { id: 'asdfasdf' } as Case;
		actions = hot('--a--', { a: new SelectCaseAction(selectedCase) });
		const expectedResults = cold('--b--', { b: new BeginLayerTreeLoadAction({ caseId: selectedCase.id }) });
		expect(layersAppEffects.selectCase$).toBeObservable(expectedResults);
	});

});
