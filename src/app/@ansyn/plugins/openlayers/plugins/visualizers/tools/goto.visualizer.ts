import { EntitiesVisualizer } from '../entities-visualizer';

import {
	IToolsState,
	selectSubMenu,
	SetActiveCenter,
	SetPinLocationModeAction,
	SubMenuEnum,
	toolsFlags,
	toolsStateSelector
} from '@ansyn/menu-items';
import { combineLatest, Observable, of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Feature from 'ol/Feature';
import { Point } from 'geojson';
import { selectActiveMapId } from '@ansyn/map-facade';
import * as turf from '@turf/turf';
import { ImageryVisualizer } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../../../maps/open-layers-map/openlayers-map/openlayers-map';
import { distinctUntilChanged, map, mergeMap, pluck, take, tap } from 'rxjs/operators';
import { OpenLayersProjectionService } from '../../../projection/open-layers-projection.service';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService]
})
export class GoToVisualizer extends EntitiesVisualizer {
	/* data */
	toolsState$ = this.store$.select(toolsStateSelector);

	pinLocation$ = this.toolsState$.pipe(
		pluck<IToolsState, Map<toolsFlags, boolean>>('flags'),
		map((flags) => flags.get(toolsFlags.pinLocation)),
		distinctUntilChanged()
	);

	isActiveMap$ = this.store$.pipe(
		select(selectActiveMapId),
		map((activeMapId) => activeMapId === this.mapId)
	);

	goToExpand$ = this.store$.select(selectSubMenu).pipe(
		map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.goTo),
		distinctUntilChanged()
	);

	activeCenter$ = this.toolsState$.pipe(
		pluck<IToolsState, number[]>('activeCenter'),
		distinctUntilChanged());

	/* events */
	@AutoSubscription
	drawPinPoint$ = combineLatest(this.isActiveMap$, this.goToExpand$, this.activeCenter$)
		.pipe(mergeMap(this.drawGotoIconOnMap.bind(this)));

	@AutoSubscription
	goToPinAvailable$ = combineLatest(this.pinLocation$, this.isActiveMap$).pipe(
		tap(([pinLocation, isActiveMap]: [boolean, boolean]) => {
			if (isActiveMap && pinLocation) {
				this.createSingleClickEvent();
			} else {
				this.removeSingleClickEvent();
			}
		})
	);

	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: 'assets/icons/tools/go-to-map-marker.svg'
		}),
		zIndex: 100
	});

	public singleClickListener(e) {
		this.projectionService
			.projectAccurately({ type: 'Point', coordinates: e.coordinate }, this.iMap)
			.pipe(take(1))
			.subscribe((point: Point) => {
				this.store$.dispatch(new SetPinLocationModeAction(false));
				this.store$.dispatch(new SetActiveCenter(point.coordinates));
			});
	}

	constructor(public store$: Store<any>, protected projectionService: OpenLayersProjectionService) {
		super();
	}

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}

	public createSingleClickEvent() {
		return this.iMap && this.iMap.mapObject.on('singleclick', this.singleClickListener, this);
	}

	public removeSingleClickEvent(): void {
		return this.iMap && this.iMap.mapObject.un('singleclick', this.singleClickListener, this);
	}

	drawGotoIconOnMap([isActiveMap, goToExpand, activeCenter]: [boolean, boolean, number[]]): Observable<boolean> {
		if (goToExpand && isActiveMap) {
			const featureJson: GeoJSON.Feature<any> = turf.point(activeCenter);
			return this.setEntities([{ id: 'goto', featureJson }]);
		}
		this.clearEntities();
		return of(true);
	}

	onDispose() {
		this.removeSingleClickEvent();
		super.onDispose();
	}
}
