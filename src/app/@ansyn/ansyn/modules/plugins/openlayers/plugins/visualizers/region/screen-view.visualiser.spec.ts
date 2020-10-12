import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { PolygonSearchVisualizer as ScreenViewSearchVisualizer } from './polygon-search.visualizer';
import { OpenLayersProjectionService } from '@ansyn/ol';

describe('screenViewSearchVisualizer', () => {
	let screenViewSearchVisualizer: ScreenViewSearchVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ScreenViewSearchVisualizer, { provide: OpenLayersProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([ScreenViewSearchVisualizer], (_screenViewSearchVisualizer: ScreenViewSearchVisualizer) => {
		screenViewSearchVisualizer = _screenViewSearchVisualizer;
	}));

	it('onContextMenu should dispatch action UpdateStatusFlagsAction', () => {
		const fakePoint = [0, 0];
		spyOn(store, 'dispatch');
		screenViewSearchVisualizer.onContextMenu(fakePoint);
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateGeoFilterStatus({
			type: screenViewSearchVisualizer.geoFilter,
			active: true
		}));
	});
});
