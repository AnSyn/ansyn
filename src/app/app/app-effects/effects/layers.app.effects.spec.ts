import {
	ILayerState, initialLayersState, layersFeatureKey, LayersReducer,
	layersStateSelector
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import {
	BeginLayerTreeLoadAction, SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';

import { async, inject, TestBed } from '@angular/core/testing';
import { LayersAppEffects } from './layers.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import {
	casesFeatureKey, CasesReducer, casesStateSelector, ICasesState,
	initialCasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cloneDeep } from 'lodash';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { IAppState } from '../app.effects.module';
import 'rxjs/add/observable/of';

describe('LayersAppEffects', () => {
	let layersAppEffects: LayersAppEffects;
	let actions: Observable<any>;
	let store: Store<IAppState>;
	const casesState: ICasesState = cloneDeep(initialCasesState);
	const layerState: ILayerState = cloneDeep(initialLayersState);

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({
				[layersFeatureKey]: LayersReducer,
				[casesFeatureKey]: CasesReducer
			})
			],
			providers: [
				provideMockActions(() => actions),
				LayersAppEffects,
				ImageryCommunicatorService
			]

		}).compileComponents();
	}));
	beforeEach(inject([Store], (_store: Store<IAppState>) => {
		store = _store;
		const fakeStore = new Map<any, any>([
			[casesStateSelector, casesState],
			[layersStateSelector, layerState]
		]);
		casesState.selectedCase = <any> { state: { layers: { displayAnnotationsLayer: false, annotationsLayer: <any>'' } } };
		spyOn(store, 'select').and.callFake((selector) => Observable.of(fakeStore.get(selector)));
	}));

	beforeEach(inject([LayersAppEffects], (_layersAppEffects: LayersAppEffects) => {
		layersAppEffects = _layersAppEffects;
	}));

	describe('selectCase$', () => {

		it('selectCase$', () => {
			let selectedCase = <any> {
				id: 'id',
				state: { layers: { displayAnnotationsLayer: true, annotationsLayer: 'geoJSON' } }
			};
			actions = hot('--a--', { a: new SelectCaseAction(selectedCase) });
			const expectedResults = cold('--(abc)--', {
				a: new SetAnnotationsLayer(<any>'geoJSON'),
				b: new ToggleDisplayAnnotationsLayer(true),
				c: new BeginLayerTreeLoadAction({ caseId: 'id' })
			});
			expect(layersAppEffects.selectCase$).toBeObservable(expectedResults);
		});
	});

	describe('toggleAnnotationsLayer$ should check hide show annotaion layers', () => {
		it('displayAnnotationLayer - true', () => {
			actions = hot('--a--', { a: new ToggleDisplayAnnotationsLayer(true) });
			const expectedResults = cold('--(b)--', {
				b: new AnnotationVisualizerAgentAction({ operation: 'show', relevantMaps: 'all' })
			});
			expect(layersAppEffects.toggleAnnotationsLayer$).toBeObservable(expectedResults);
		});

		it('displayAnnotationLayer - false', () => {
			actions = hot('--a--', { a: new ToggleDisplayAnnotationsLayer(false) });
			const expectedResults = cold('--(b)--', {
				b: new AnnotationVisualizerAgentAction({ operation: 'hide', relevantMaps: 'all' })
			});
			expect(layersAppEffects.toggleAnnotationsLayer$).toBeObservable(expectedResults);
		});
	});

});
