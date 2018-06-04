import { EntitiesVisualizer } from '../entities-visualizer';

import {
	IToolsState,
	selectSubMenu,
	SubMenuEnum,
	toolsFlags,
	toolsStateSelector
} from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import Feature from 'ol/feature';
import { Point } from 'geojson';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import 'rxjs/add/observable/combineLatest';
import * as turf from '@turf/turf';
import { SetActiveCenter, SetPinLocationModeAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryVisualizer } from '@ansyn/imagery/model/base-imagery-visualizer';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store]
})
export class GoToVisualizer extends EntitiesVisualizer {
	/* data */
	mapState$ = this.store$.select(mapStateSelector);
	toolsState$ = this.store$.select(toolsStateSelector);

	pinLocation$ = this.toolsState$
		.pluck<IToolsState, Map<toolsFlags, boolean>>('flags')
		.map((flags) => flags.get(toolsFlags.pinLocation))
		.distinctUntilChanged();

	isActiveMap$ = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.distinctUntilChanged()
		.map((activeMapId) => activeMapId === this.mapId);

	goToExpand$ = this.store$.select(selectSubMenu)
		.map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.goTo)
		.distinctUntilChanged();

	activeCenter$ = this.toolsState$
		.pluck<IToolsState, number[]>('activeCenter')
		.distinctUntilChanged();

	/* events */
	drawPinPoint$ = Observable
		.combineLatest(this.isActiveMap$, this.goToExpand$, this.activeCenter$)
		.mergeMap(this.drawGotoIconOnMap.bind(this));

	goToPinAvailable$ = Observable.combineLatest(this.pinLocation$, this.isActiveMap$)
		.do(([pinLocation, isActiveMap]: [boolean, boolean]) => {
			if (isActiveMap && pinLocation) {
				this.createSingleClickEvent();
			} else {
				this.removeSingleClickEvent();
			}
		});

	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: 'assets/icons/tools/go-to-map-marker.svg'
		}),
		zIndex: 100
	});

	public singleClickListener(e) {
		this.iMap.projectionService
			.projectAccurately({ type: 'Point', coordinates: e.coordinate }, this.iMap)
			.take(1)
			.subscribe((point: Point) => {
				this.store$.dispatch(new SetPinLocationModeAction(false));
				this.store$.dispatch(new SetActiveCenter(point.coordinates));
			});
	}

	constructor(public store$: Store<any>) {
		super();
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.drawPinPoint$.subscribe(),
			this.goToPinAvailable$.subscribe()
		);
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
		return Observable.of(true);
	}

	onDispose() {
		this.removeSingleClickEvent();
		super.onDispose();
	}
}
