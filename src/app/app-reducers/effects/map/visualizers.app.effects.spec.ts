import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { ContextMenuAppEffects } from './context-menu.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { VisualizersAppEffects } from './visualizers.app.effects';
import { HoverFeatureChangedTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import { OverlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';
import { DisplayOverlayFromStoreAction } from '../../../packages/overlays/actions/overlays.actions';
import { dbclickFeatureTriggerAction } from '../../../packages/map-facade/actions/map.actions';

describe('ContextMenuAppEffects', () => {
	let visualizersAppEffects: VisualizersAppEffects;
	let store: Store<any>;
	let effectsRunner: EffectsRunner;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({cases: CasesReducer})
			],
			providers: [
				VisualizersAppEffects
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store, VisualizersAppEffects, EffectsRunner], (_store: Store<any>, _visualizersAppEffects: VisualizersAppEffects, _effectsRunner: EffectsRunner) => {
		store = _store;
		visualizersAppEffects= _visualizersAppEffects;
		effectsRunner = _effectsRunner;
	}));

	// it('onContextMenuDisplayAction$ should return OverlaysMarkupAction with markup result', () => {
	// 	spyOn(CasesService, 'getOverlaysMarkup').and.returnValue([{id:'1234-5678', class: 'hover'}]);
	// 	effectsRunner.queue(new HoverFeatureChangedTriggerAction('1234-5678'));
	// 	let result;
	// 	visualizersAppEffects.onContextMenuDisplayAction$.subscribe(_result => result = _result);
	// 	expect(result.constructor).toEqual(OverlaysMarkupAction);
	// 	expect(result.payload).toEqual([{id: '1234-5678', class: 'hover'}])
	// });

	it('onDbclickFeatureDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
		effectsRunner.queue(new dbclickFeatureTriggerAction('fakeId'));
		let result: DisplayOverlayFromStoreAction;
		visualizersAppEffects.onDbclickFeatureDisplayAction$.subscribe(_result => result = _result);
		expect(result.constructor).toEqual(DisplayOverlayFromStoreAction);
		expect(result.payload.id).toEqual('fakeId');
	});
});
