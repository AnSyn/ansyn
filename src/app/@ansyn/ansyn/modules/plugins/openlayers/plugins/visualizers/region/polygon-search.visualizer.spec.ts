import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UUID } from 'angular2-uuid';
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

	it('createRegion should return "Feature" with searchMode property equal to Polygon', () => {
		const fakeGeojson: Feature<any> = {
			geometry: {},
			type: "Feature",
			properties: {}
		};
		const region = polygonSearchVisualizer.createRegion(fakeGeojson);
		const expectedResult = region.properties.searchMode;
		expect(expectedResult).toEqual('Polygon');
	});

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
});
