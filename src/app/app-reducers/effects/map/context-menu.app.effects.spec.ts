import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { ContextMenuAppEffects } from './context-menu.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import {
	ContextMenuDisplayAction,
	ContextMenuGetFilteredOverlaysAction,
	ContextMenuShowAction,
} from '@ansyn/map-facade/actions/map.actions';
import {
	DisplayOverlayFromStoreAction,
	LoadOverlaysSuccessAction,
	SetFiltersAction
} from '@ansyn/overlays/actions/overlays.actions';
import * as turf from '@turf/turf';
import { MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';

describe('ContextMenuAppEffects', () => {
	let contextMenuAppEffects: ContextMenuAppEffects;
	let store: Store<any>;
	let effectsRunner: EffectsRunner;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({ cases: CasesReducer, overlays: OverlayReducer, map: MapReducer })
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

		store.dispatch(new LoadOverlaysSuccessAction([
			{ id: '1', footprint: 'in' },
			{ id: '2', footprint: 'in' },
			{ id: '3', footprint: 'out' },
			{ id: '4', footprint: 'out' },
			{ id: '5', footprint: 'in' }
		] as any[]));

		spyOn(OverlaysService, 'filter').and.returnValue(['1', '2', '3', '4', '5']);

		store.dispatch(new SetFiltersAction({}));
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
			point: {
				type: 'Point',
				coordinates: [0, 0],
			},
			e: new MouseEvent(null, null)
		});
		spyOnProperty(turf, 'inside', 'get').and.returnValue((point, footprint) => footprint === 'in');
		effectsRunner.queue(showAction);
		let result: ContextMenuGetFilteredOverlaysAction;
		contextMenuAppEffects.setContextFilter$.subscribe(_result => result = _result);
		expect(result.constructor).toEqual(ContextMenuGetFilteredOverlaysAction);
		expect(result.payload.length).toEqual(3);
	});

});
