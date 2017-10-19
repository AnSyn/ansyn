import { async, inject, TestBed } from '@angular/core/testing';

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
import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Overlay } from '../../../packages/core/models/overlay.model';

describe('ContextMenuAppEffects', () => {
	let contextMenuAppEffects: ContextMenuAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
	const fakeOverlays = [
		{ id: '1', footprint: 'in' },
		{ id: '2', footprint: 'in' },
		{ id: '3', footprint: 'out' },
		{ id: '4', footprint: 'out' },
		{ id: '5', footprint: 'in' }
	] as Overlay[];
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [

				StoreModule.forRoot({ cases: CasesReducer, overlays: OverlayReducer, map: MapReducer })
			],
			providers: [
				provideMockActions(() => actions),
				ContextMenuAppEffects
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store, ContextMenuAppEffects], (_store: Store<any>, _contextMenuAppEffects: ContextMenuAppEffects) => {
		store = _store;
		contextMenuAppEffects = _contextMenuAppEffects;
		store.dispatch(new LoadOverlaysSuccessAction(fakeOverlays));
		spyOn(OverlaysService, 'filter').and.returnValue(['1', '2', '3', '4', '5']);

		store.dispatch(new SetFiltersAction({}));
	}));

	it('onContextMenuDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
		actions = hot('--a--', { a: new ContextMenuDisplayAction('fakeId') });
		const expectedResults = cold('--b--', { b: new DisplayOverlayFromStoreAction({ id: 'fakeId' }) });
		expect(contextMenuAppEffects.onContextMenuDisplayAction$).toBeObservable(expectedResults);
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
		actions = hot('--a--', { a: showAction });
		const expectedResults = cold('--b--', { b: new ContextMenuGetFilteredOverlaysAction(fakeOverlays.filter((o) => o.footprint === 'in')) });
		expect(contextMenuAppEffects.setContextFilter$).toBeObservable(expectedResults);
	});

});
