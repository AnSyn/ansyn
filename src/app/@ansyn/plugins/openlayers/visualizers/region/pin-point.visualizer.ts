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
import { Point } from 'geojson';
import { statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { statusBarFlagsItemsEnum, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import { MapActionTypes, PinPointTriggerAction } from '@ansyn/map-facade';
import { SetPinLocationModeAction, ToolsActionsTypes } from '@ansyn/menu-items';

export class IconVisualizer extends RegionVisualizer {

	// If pin-location mode, disable singleClickEvent
	updatePinLocationAction$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SET_PIN_LOCATION_MODE)
		.do((action: SetPinLocationModeAction) => {
			if (action.payload) {
				this.removeSingleClickEvent();
			}
		});

	contextMenuClick$: Observable<any> = this.actions$
		.ofType(MapActionTypes.TRIGGER.PIN_POINT)
		.map((action: PinPointTriggerAction) => {
			const region = getPolygonByPointAndRadius(action.payload).geometry;
			this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
		});

	pinpointSearchActive$: Observable<any> = this.store$.select(statusBarStateSelector)
		.filter((statusBarState) => statusBarState.comboBoxesProperties.geoFilter === 'Pin-Point' && Boolean(statusBarState.flags.get(statusBarFlagsItemsEnum.pinPointSearch)))
		.do(() => {
			this.createSingleClickEvent();
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
			.subscribe((point: Point) =>
			{
				this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.pinPointSearch, value: false }));
				const region = getPolygonByPointAndRadius(point.coordinates).geometry;
				this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
				this.removeSingleClickEvent();
			});
	}

	public createSingleClickEvent() {
		this.iMap.mapObject.on('singleclick', this.singleClickListener, this);
	}

	public removeSingleClickEvent() {
		this.iMap.mapObject.un('singleclick', this.singleClickListener, this);
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.contextMenuClick$.subscribe(),
			this.pinpointSearchActive$.subscribe(),
			this.updatePinLocationAction$.subscribe()
		);
	}

	onDispose() {
		this.removeSingleClickEvent();
		super.onDispose();
	}
}
