import { async, inject, TestBed } from '@angular/core/testing';

import { ContextMenuAppEffects } from './context-menu.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import {
	ContextMenuDisplayAction,
	ContextMenuShowAction
} from '@ansyn/map-facade/actions/map.actions';
import {
	DisplayOverlayFromStoreAction,
	LoadOverlaysSuccessAction,
	SetFilteredOverlaysAction
} from '@ansyn/overlays/actions/overlays.actions';
import * as turf from '@turf/turf';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { coreFeatureKey, CoreReducer } from '@ansyn/core/reducers/core.reducer';

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

				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[overlaysFeatureKey]: OverlayReducer,
					[mapFeatureKey]: MapReducer,
					[coreFeatureKey]: CoreReducer
				})
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
		store.dispatch(new SetFilteredOverlaysAction(fakeOverlays.map(({ id }) => id)));
	}));

	it('onContextMenuDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
		actions = hot('--a--', { a: new ContextMenuDisplayAction('fakeId') });
		const expectedResults = cold('--b--', { b: new DisplayOverlayFromStoreAction({ id: 'fakeId' }) });
		expect(contextMenuAppEffects.onContextMenuDisplayAction$).toBeObservable(expectedResults);
	});

});
