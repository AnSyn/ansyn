import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { RegionVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/region.visualizer';
import * as turf from '@turf/turf';
import { getPointByGeometry } from '@ansyn/core/utils/geo';
import { Position } from 'geojson';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { CaseGeoFilter, CaseRegionState } from '@ansyn/core/models/case.model';
import { SetOverlaysCriteriaAction } from '@ansyn/core/actions/core.actions';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryVisualizer } from '@ansyn/imagery/model/base-imagery-visualizer';
import { UpdateGeoFilterStatus } from '@ansyn/status-bar/actions/status-bar.actions';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, ProjectionService]
})
export class PinPointVisualizer extends RegionVisualizer {
	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: 'assets/pinpoint-indicator.svg'
		}),
		zIndex: 100
	});

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: ProjectionService) {
		super(store$, actions$, projectionService, CaseGeoFilter.PinPoint);
	}

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}

	drawRegionOnMap(region: CaseRegionState): Observable<boolean> {
		const coordinates = getPointByGeometry(<GeoJSON.GeometryObject>region).coordinates;
		const id = 'pinPoint';
		const featureJson = turf.point(coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	createRegion(geoJsonFeature: any): any {
		return geoJsonFeature.geometry;
	}

	onContextMenu(coordinates: Position): void {
		const region = turf.geometry('Point', coordinates);
		this.store$.dispatch(new UpdateGeoFilterStatus({ searchMode: CaseGeoFilter.none }));
		this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
	}
}
