import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { ContextMenuAppEffects } from './context-menu.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { ContextMenuDisplayAction, ContextMenuShowAction, SetContextMenuFiltersAction } from '@ansyn/map-facade/actions/map.actions';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import * as turf from '@turf/turf';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

describe('ContextMenuAppEffects', () => {
	let contextMenuAppEffects: ContextMenuAppEffects;
	let store: Store<any>;
	let effectsRunner: EffectsRunner;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({cases: CasesReducer, overlays: OverlayReducer})
			],
			providers: [
				ContextMenuAppEffects
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store, ContextMenuAppEffects, EffectsRunner], (_store: Store<any>, _contextMenuAppEffects: ContextMenuAppEffects, _effectsRunner: EffectsRunner) => {
		store = _store;
		contextMenuAppEffects = _contextMenuAppEffects;
		effectsRunner = _effectsRunner;
	}));

	it('onContextMenuDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
		effectsRunner.queue(new ContextMenuDisplayAction('fakeId'));
		let result: DisplayOverlayFromStoreAction;
		contextMenuAppEffects.onContextMenuDisplayAction$.subscribe(_result => result = _result);
		expect(result.constructor).toEqual(DisplayOverlayFromStoreAction);
		expect(result.payload.id).toEqual('fakeId');
	});

	it('setContextFilter$ should get point and filter filteredOverlays by footprint', () => {
		const showAction = new ContextMenuShowAction({
			point: 'point'
		});
		spyOn(OverlaysService, 'pluck').and.returnValue([
			{id: 1, footprint: 'in'},
			{id: 2, footprint: 'in'},
			{id: 3, footprint: 'out'},
			{id: 4, footprint: 'out'},
			{id: 5, footprint: 'in'}
		]);
		spyOn(CasesService, 'activeMap').and.returnValue({});
		spyOnProperty(turf, 'inside', 'get').and.returnValue((point, footprint) => footprint === 'in');
		effectsRunner.queue(showAction);
		let result: SetContextMenuFiltersAction;
		contextMenuAppEffects.setContextFilter$.subscribe(_result => result = _result);
		expect(result.constructor).toEqual(SetContextMenuFiltersAction);
		expect(result.payload.filteredOverlays.length).toEqual(3);
	});

});
