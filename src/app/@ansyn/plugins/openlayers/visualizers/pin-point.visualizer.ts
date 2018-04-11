import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { CaseRegionState } from '@ansyn/core';
import { Actions } from '@ngrx/effects';
import { getPointByGeometry } from '@ansyn/core/utils';
import { RegionVisualizer } from '@ansyn/plugins/openlayers/visualizers/region.visualizer';
import * as turf from '@turf/turf'
import { UUID } from 'angular2-uuid';

export class IconVisualizer extends RegionVisualizer {
	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: '/assets/pinpoint-indicator.svg'
		}),
		zIndex: 100
	});

	constructor(public store$: Store<any>, public actions$: Actions) {
		super(store$, actions$, 'Pin-Point');
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
}
