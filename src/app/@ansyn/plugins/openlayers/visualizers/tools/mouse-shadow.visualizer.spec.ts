import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { PolygonSearchVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/polygon-search.visualizer';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { EffectsModule } from '@ngrx/effects';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Feature, Polygon } from 'geojson';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { MouseShadowVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/mouse-shadow.visualizer';

describe('mouseShadowVisualizer', () => {
	let mouseShadowVisualizer: MouseShadowVisualizer;
	let store: Store<any>;


	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({})]
		});
	});


	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([ProjectionService], (projectionService: ProjectionService) => {
		projectionService = projectionService;
	}));


});
