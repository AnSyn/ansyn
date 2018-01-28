// import { FiltersService } from '@ansyn/menu-items';
// import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
// import { InitializeFiltersSuccessAction } from '@ansyn/menu-items/filters/actions/filters.actions';
//
// it('updateCaseFacets$ effect', () => {
// 	actions = hot('--a--', { a: new InitializeFiltersSuccessAction(null) });
// 	const facets = FiltersService.buildCaseFacets(filtersState);
// 	const update = <any> {
// 		...selectedCase,
// 		state: {
// 			...selectedCase.state,
// 			facets
// 		}
// 	};
// 	const expectedResults = cold('--b--', { b: new UpdateCaseAction(update) });
// 	expect(filtersAppEffects.updateCaseFacets$).toBeObservable(expectedResults);
// });


// import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
// import { Case } from '@ansyn/core/models/case.model';
// import {
// 	SetAnnotationsLayer,
// 	ToggleDisplayAnnotationsLayer
// } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
//
// describe('annotationUpdateCase$ should update case via layers state (annotationsLayer, displayAnnotationsLayer)', () => {
//
// 	it('displayAnnotationsLayer', () => {
// 		layerState.annotationsLayer = <any>'some geoJSON';
// 		layerState.displayAnnotationsLayer = true;
//
// 		const updatedCase = <Case> {
// 			...casesState.selectedCase, state: {
// 				...casesState.selectedCase.state,
// 				layers: {
// 					...casesState.selectedCase.state.layers,
// 					annotationsLayer: layerState.annotationsLayer ,
// 					displayAnnotationsLayer: layerState.displayAnnotationsLayer
// 				}
// 			}
// 		};
// 		actions = hot('--a--', { a: new ToggleDisplayAnnotationsLayer(layerState.displayAnnotationsLayer) });
// 		const expectedResults = cold('--b--', { b: new UpdateCaseAction(updatedCase) });
// 		expect(layersAppEffects.annotationUpdateCase$).toBeObservable(expectedResults);
// 	});
//
// 	it('annotationsLayer', () => {
// 		layerState.annotationsLayer = <any>'some geoJSON';
// 		layerState.displayAnnotationsLayer = false;
//
// 		const updatedCase = <Case> {
// 			...casesState.selectedCase, state: {
// 				...casesState.selectedCase.state,
// 				layers: {
// 					...casesState.selectedCase.state.layers,
// 					annotationsLayer: layerState.annotationsLayer ,
// 					displayAnnotationsLayer: layerState.displayAnnotationsLayer
// 				}
// 			}
// 		};
// 		actions = hot('--a--', { a: new SetAnnotationsLayer(layerState.annotationsLayer) });
// 		const expectedResults = cold('--b--', { b: new UpdateCaseAction(updatedCase) });
// 		expect(layersAppEffects.annotationUpdateCase$).toBeObservable(expectedResults);
// 	});
//
// });
