import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { CaseRegionState } from 'app/@ansyn/core/index';
import { Actions } from '@ngrx/effects';
import { getPointByGeometry } from 'app/@ansyn/core/utils/index';
import { RegionVisualizer } from 'app/@ansyn/plugins/openlayers/visualizers/region/region.visualizer';
import * as turf from '@turf/turf'
import { getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import { CaseGeoFilter, SetOverlaysCriteriaAction } from '@ansyn/core';
import { Position } from 'geojson';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { statusBarFlagsItemsEnum, UpdateStatusFlagsAction } from '@ansyn/status-bar';

export class PinPointVisualizer extends RegionVisualizer {
	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: '/assets/pinpoint-indicator.svg'
		}),
		zIndex: 100
	});

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: ProjectionService) {
		super(store$, actions$, projectionService, CaseGeoFilter.PinPoint);
	}

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}

	drawRegionOnMap(region: CaseRegionState): Observable<boolean>  {
		const coordinates = getPointByGeometry(<GeoJSON.GeometryObject>region).coordinates;
		const id = 'pinPoint';
		const featureJson = turf.point(coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	createRegion(geoJsonFeature: any): any {
		return getPolygonByPointAndRadius(geoJsonFeature.geometry.coordinates).geometry;
	}

	onContextMenu(coordinates: Position): void {
		const region = getPolygonByPointAndRadius(coordinates).geometry;
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));
		this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
	}
}
