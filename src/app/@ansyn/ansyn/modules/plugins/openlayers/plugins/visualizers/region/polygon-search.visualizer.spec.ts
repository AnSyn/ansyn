import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { Feature, Polygon } from 'geojson';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { PolygonSearchVisualizer } from './polygon-search.visualizer';
import { OpenLayersProjectionService } from '@ansyn/ol';

describe('PolygonSearchVisualizer', () => {
	let polygonSearchVisualizer: PolygonSearchVisualizer;
	let store: Store<any>;


	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [PolygonSearchVisualizer, { provide: OpenLayersProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});


	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([PolygonSearchVisualizer], (_polygonSearchVisualizer: PolygonSearchVisualizer) => {
		polygonSearchVisualizer = _polygonSearchVisualizer;
	}));

	it('onContextMenu should dispatch action UpdateStatusFlagsAction', () => {
		const fakePoint = [0, 0];
		spyOn(store, 'dispatch');
		polygonSearchVisualizer.onContextMenu(fakePoint);
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateGeoFilterStatus({
			type: polygonSearchVisualizer.geoFilter,
			active: true
		}));
	});

	it('drawRegionOnMap calls setEntities with Feature', () => {
		const id = 'pinPolygon';
		const fakeGeojson: Feature<any> = {
			geometry: {
				type: 'Polygon',
				coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]]
			},
			type: "Feature",
			properties: {}
		};
		spyOn(polygonSearchVisualizer, 'setEntities').and.callFake(() => EMPTY);
		polygonSearchVisualizer.drawRegionOnMap(fakeGeojson);
		expect(polygonSearchVisualizer.setEntities).toHaveBeenCalledWith([{ id, featureJson: fakeGeojson }]);
	});

	describe('createRegion', () => {
		it('should return the geometry property of the input', () => {
			const fakeGeojson: Feature<Polygon> = {
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [[]]
				},
				properties: {}
			};
			const result = polygonSearchVisualizer.createRegion(fakeGeojson);
			expect(result.geometry).toEqual(fakeGeojson.geometry);
			expect(result.properties['searchMode']).toEqual('Polygon');
		});

		it('should return, for one-segment polygon, a quadrangle', () => {
			const fakeGeojson: Feature<Polygon> = {
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [[
						[1, 2], [3, 4], [1, 2]
					]]
				},
				properties: {}
			};
			const result = polygonSearchVisualizer.createRegion(fakeGeojson);
			expect(result.geometry.coordinates[0].length).toEqual(5);
			expect(result.properties['searchMode']).toEqual('Polygon');
		});
	});
});
