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
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import { SetOverlaysCriteriaAction } from '@ansyn/core';
import { Point, Position } from 'geojson';
import { statusBarFlagsItemsEnum, UpdateStatusFlagsAction } from '@ansyn/status-bar';

export class IconVisualizer extends RegionVisualizer {

	geoFilterSearchActive$: Observable<any> = this.onSearchMode$
		.do((onSearchMode: boolean) => {
			if (onSearchMode) {
				this.createSingleClickEvent();
			} else {
				this.removeSingleClickEvent();
			}
		});


	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: '/assets/pinpoint-indicator.svg'
		}),
		zIndex: 100
	});

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: ProjectionService) {
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

	public singleClickListener(e) {
		this.iMap.projectionService
			.projectAccurately({type: 'Point', coordinates: e.coordinate}, this.iMap)
			.take(1)
			.withLatestFrom(this.onSearchMode$)
			.filter(([point, onSearchMode]) => onSearchMode)
			.map(([point]: [Point, boolean]) => point.coordinates)
			.do(this.updateRegion.bind(this))
			.do(() => {
				this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));
			})
			.subscribe();
	}

	public createSingleClickEvent() {
		this.iMap.mapObject.on('singleclick', this.singleClickListener, this);
	}

	public removeSingleClickEvent() {
		this.iMap.mapObject.un('singleclick', this.singleClickListener, this);
	}

	updateRegion(coordinates: Position): void {
		const region = getPolygonByPointAndRadius(coordinates).geometry;
		this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
	}

	onContextMenu(position: Position): void {
		this.updateRegion(position);
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.geoFilterSearchActive$.subscribe()
		);
	}

	onDispose() {
		this.removeSingleClickEvent();
		super.onDispose();
	}
}
