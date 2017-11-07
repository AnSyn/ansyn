import { layersFeatureKey, LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import {
	BeginLayerTreeLoadAction,
	HideAnnotationsLayer,
	ShowAnnotationsLayer
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
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	ICasesState,
	initialCasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cloneDeep } from 'lodash';

describe('LayersAppEffects', () => {
	let layersAppEffects: LayersAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let caseState: ICasesState = cloneDeep(initialCasesState);

	caseState.selectedCase = <Case>{};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({
				[layersFeatureKey]: LayersReducer,
				[casesFeatureKey]: CasesReducer
			})],
			providers: [
				provideMockActions(() => actions),
				LayersAppEffects
			]

		}).compileComponents();
	}));


	describe('select case', () => {

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

	describe('check hide show annotaion layers', () => {

		beforeEach(inject([Store], (_store: Store<any>) => {
			store = _store;
			const fakeStore = new Map<any, any>([
				[casesStateSelector, caseState]
			]);
			spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
		}));

		beforeEach(inject([LayersAppEffects], (_layersAppEffects: LayersAppEffects) => {
			layersAppEffects = _layersAppEffects;
		}));

		it('showAnnotationLayer$ - false', () => {

			layersAppEffects.selectedCase$ = Observable.of({});

			actions = hot('--a--', { a: new ShowAnnotationsLayer({ update: false }) });

			const expectedResults = cold('--(b)--', {
				b: new AnnotationVisualizerAgentAction({
					action: 'show',
					maps: 'all'
				})
			});
			expect(layersAppEffects.showAnnotationsLayer$).toBeObservable(expectedResults);
		});

		it('showAnnotationLayer$ - true', () => {
			// this is referecne to init the selected case with the data I want the effect to come
			// back as a result from this.store.select<T>(<R>);
			caseState.selectedCase = <Case>{
				state: {
					layers: {}
				}
			};

			actions = hot('--a--', { a: new ShowAnnotationsLayer({ update: true }) });
			const newCaseState: Case = <Case>{
				state: {
					layers: {
						displayAnnotationsLayer: true
					}
				}
			};

			const expectedResults = cold('--(ab)--', {
				a: new AnnotationVisualizerAgentAction({
					action: 'show',
					maps: 'all'
				}),
				b: new UpdateCaseAction(newCaseState)
			});
			expect(layersAppEffects.showAnnotationsLayer$).toBeObservable(expectedResults);
		});

		it('hideAnnotationLayer$ - false', () => {

			layersAppEffects.selectedCase$ = Observable.of({});

			actions = hot('--a--', { a: new HideAnnotationsLayer({ update: false }) });

			const expectedResults = cold('--(b)--', {
				b: new AnnotationVisualizerAgentAction({
					action: 'removeLayer',
					maps: 'all'
				})
			});
			expect(layersAppEffects.hideAnnotationsLayer$).toBeObservable(expectedResults);
		});

		it('hideAnnotationLayer$ - true', () => {
			// this is referecne to init the selected case with the data I want the effect to come
			// back as a result from this.store.select<T>(<R>);
			caseState.selectedCase = <Case>{
				state: {
					layers: {}
				}
			};

			actions = hot('--a--', { a: new HideAnnotationsLayer({ update: true }) });
			const newCaseState: Case = <Case>{
				state: {
					layers: {
						displayAnnotationsLayer: false
					}
				}
			};

			const expectedResults = cold('--(ab)--', {
				a: new AnnotationVisualizerAgentAction({
					action: 'removeLayer',
					maps: 'all'
				}),
				b: new UpdateCaseAction(newCaseState)
			});
			expect(layersAppEffects.hideAnnotationsLayer$).toBeObservable(expectedResults);
		});

		afterEach(() => {
			caseState.selectedCase = <Case> {};
		});

	});


});
