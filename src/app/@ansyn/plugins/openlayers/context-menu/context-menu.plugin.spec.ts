import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery';
import { EffectsModule } from '@ngrx/effects';
import { ContextMenuDisplayAction, mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { cold, hot } from 'jasmine-marbles';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs/index';
import { SetMapsDataActionStore } from '@ansyn/core';
import { ContextMenuPlugin } from './context-menu.plugin';

describe('ContextMenuPlugin', () => {
	let contextMenuPlugin: ContextMenuPlugin;
	let store: Store<any>;
	const activeMapId = 'mapId';
	let actions: Observable<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideMockActions(() => actions),
				ContextMenuPlugin, { provide: ProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({
				[mapFeatureKey]: MapReducer
			}), EffectsModule.forRoot([])]
		});
	});

	beforeEach(inject([Store, ContextMenuPlugin], (_store: Store<any>, _contextMenuPlugin: ContextMenuPlugin) => {
		store = _store;
		contextMenuPlugin = _contextMenuPlugin;
		store.dispatch(new SetMapsDataActionStore({ activeMapId }));
		spyOnProperty(contextMenuPlugin, 'mapId', 'get').and.returnValue(activeMapId);
	}));

	it('should be defined', () => {
		expect(contextMenuPlugin).toBeDefined();
	});

	it('onContextMenuDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
		contextMenuPlugin.onContextMenuDisplayAction$.subscribe();
		actions = hot('--a--', { a: new ContextMenuDisplayAction('fakeId') });
		const expectedResults = cold('--b--', { b: new DisplayOverlayFromStoreAction({ id: 'fakeId' }) });
		expect(contextMenuPlugin.onContextMenuDisplayAction$).toBeObservable(expectedResults);
	});


});
