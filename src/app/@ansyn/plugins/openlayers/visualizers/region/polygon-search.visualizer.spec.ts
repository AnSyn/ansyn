import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery';
import { EffectsModule } from '@ngrx/effects';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';
import { Feature, Polygon } from 'geojson';
import { UpdateGeoFilterStatus } from '@ansyn/status-bar';
import { PolygonSearchVisualizer } from './polygon-search.visualizer';

describe('PolygonSearchVisualizer', () => {
	let polygonSearchVisualizer: PolygonSearchVisualizer;
	let store: Store<any>;


	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [PolygonSearchVisualizer, { provide: ProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});


	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([PolygonSearchVisualizer], (_polygonSearchVisualizer: PolygonSearchVisualizer) => {
		polygonSearchVisualizer = _polygonSearchVisualizer;
	}));

	it('createRegion should return "geometry"', () => {
		const fakeGeojson = <any> { geometry: 'geometry' };
		const expectedResult = polygonSearchVisualizer.createRegion(fakeGeojson);
		expect(expectedResult).toEqual('geometry');
	});

	it('onContextMenu should dispatch action UpdateStatusFlagsAction', () => {
		const fakePoint = [0, 0];
		spyOn(store, 'dispatch');
		polygonSearchVisualizer.onContextMenu(fakePoint);
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateGeoFilterStatus({
			searchMode: polygonSearchVisualizer.geoFilter,
			indicator: true
		}));
	});

	it('drawRegionOnMap calls setEntities with Feature', () => {
		const id = 'fakeId';
		const fakeGeojson: Polygon = { type: 'Polygon', coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]] };
		spyOn(UUID, 'UUID').and.callFake(() => id);
		spyOn(polygonSearchVisualizer, 'setEntities').and.callFake(() => Observable.empty());
		const expectFeatureJson: Feature<Polygon> = { type: 'Feature', geometry: fakeGeojson, properties: {} };
		polygonSearchVisualizer.drawRegionOnMap(fakeGeojson);
		expect(polygonSearchVisualizer.setEntities).toHaveBeenCalledWith([{ id, featureJson: expectFeatureJson }]);
	});
});
