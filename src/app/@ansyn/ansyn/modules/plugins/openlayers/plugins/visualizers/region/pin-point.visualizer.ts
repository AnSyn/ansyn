import Feature from 'ol/Feature';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import * as turf from '@turf/turf';
import { getPointByGeometry, ImageryVisualizer } from '@ansyn/imagery';
import { Position } from 'geojson';
import { OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { RegionVisualizer } from './region.visualizer';
import { CaseGeoFilter, CaseRegionState } from '../../../../../menu-items/cases/models/case.model';
import { SetOverlaysCriteriaAction } from '../../../../../overlays/actions/overlays.actions';
import { Injectable } from '@angular/core';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService],
	dontRestrictToExtent: true,
	layerClassName: 'pin-point-layer'
})
@Injectable()
export class PinPointVisualizer extends RegionVisualizer {
	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: 'assets/pinpoint-indicator.svg'
		}),
		zIndex: 100
	});

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: OpenLayersProjectionService) {
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
		this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
	}
}
