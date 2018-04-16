import { EntitiesVisualizer } from '../entities-visualizer';
import {
	GoToExpandAction,
	IToolsState,
	SetActiveCenter,
	SetPinLocationModeAction,
	toolsFlags
} from '@ansyn/menu-items';
import { toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Observable } from 'rxjs/Observable';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import Feature from 'ol/feature';
import { Point } from 'geojson';
import { CommunicatorEntity } from '@ansyn/imagery';
import { ActiveMapChangedAction, MapActionTypes, mapStateSelector } from '@ansyn/map-facade';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { GoToInputChangeAction, ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { CaseMapState } from '@ansyn/core';

export class GoToVisualizer extends EntitiesVisualizer {

	mapState$ = this.store$.select(mapStateSelector);
	toolsState$ = this.store$.select(toolsStateSelector);

	pinLocation$ = this.toolsState$
		.pluck<IToolsState, Map<toolsFlags, boolean>>('flags')
		.map((flags) => flags.get(toolsFlags.pinLocation))
		.distinctUntilChanged();

	activeMapId$ = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.distinctUntilChanged();

	goToExpand$ = this.toolsState$
		.pluck<IToolsState, boolean>('gotoExpand')
		.distinctUntilChanged();

	activeCenter$ = this.toolsState$
		.pluck<IToolsState, number[]>('activeCenter')
		.distinctUntilChanged();

	goToPinAvailable$ = Observable.merge(this.pinLocation$, this.activeMapId$)
		.withLatestFrom(this.pinLocation$, this.activeMapId$, this.activeCenter$, this.goToExpand$)
		.do(([_, pinLocation, activeMapId, activeCenter, gotoExpand]: [any, boolean, string, number[], boolean]) => {
			if (activeMapId === this.mapId && pinLocation) {
				this.createSingleClickEvent();
			} else {
				this.removeSingleClickEvent();
			}
		});

	gotoIconVisibilityOnGoToWindowChanged$ = this.actions$
		.ofType<GoToExpandAction>(ToolsActionsTypes.GO_TO_EXPAND)
		.withLatestFrom(this.goToExpand$, this.activeCenter$, this.activeMapId$)
		.filter(([action, gotoExpand, activeCenter, activeMapId]) => activeMapId === this.mapId)
		.mergeMap(([action, gotoExpand, activeCenter]: [GoToExpandAction, boolean, number[], string]) => {
			return this.drawGotoIconOnMap(gotoExpand, activeCenter);
		});

	OnGoToInputChanged$ = this.actions$
		.ofType(ToolsActionsTypes.GO_TO_INPUT_CHANGED)
		.withLatestFrom(this.goToExpand$, this.activeMapId$)
		.filter(([action, gotoExpand, activeMapId]) => activeMapId === this.mapId)
		.mergeMap(([action, goToExpand ]: [GoToInputChangeAction, boolean, string]) => {
			return this.drawGotoIconOnMap(goToExpand, action.payload);
		});

	onActiveMapChangesRedrawPinLocation$ = this.actions$
		.ofType<ActiveMapChangedAction>(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.mapState$, this.toolsState$)
		.filter(([action, mapState, toolState]: [ActiveMapChangedAction, IMapState, IToolsState]) => toolState.gotoExpand)
		.mergeMap(([action, mapState, toolState]: [ActiveMapChangedAction, IMapState, IToolsState]) => {
			return this.drawGotoIconOnMap(this.mapId === action.payload, toolState.activeCenter);
		});

	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: '/assets/icons/tools/go-to-map-marker.svg'
		}),
		zIndex: 100
	});

	public singleClickListener(e) {
		this.iMap.projectionService
			.projectAccurately({type: 'Point', coordinates: e.coordinate}, this.iMap)
			.take(1)
			.subscribe((point: Point) =>
			{
				this.store$.dispatch(new SetPinLocationModeAction(false));
				this.store$.dispatch(new SetActiveCenter(point.coordinates));
			});
	}

	constructor(public store$: Store<any>, public actions$: Actions, public communicator: CommunicatorEntity) {
		super();
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.goToPinAvailable$.subscribe(),
			this.gotoIconVisibilityOnGoToWindowChanged$.subscribe(),
			this.OnGoToInputChanged$.subscribe(),
			this.onActiveMapChangesRedrawPinLocation$.subscribe()
		);
	}


	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}

	public createSingleClickEvent(): void {
		return this.iMap && this.iMap.mapObject.on('singleclick', this.singleClickListener, this);
	}

	public removeSingleClickEvent(): void {
		return this.iMap && this.iMap.mapObject.un('singleclick', this.singleClickListener, this);
	}

	drawGotoIconOnMap(gotoExpand, point: number[]): Observable<boolean> {
		if (gotoExpand) {
			const gotoPoint: GeoJSON.Point = {
				type: 'Point',
				coordinates: point
			};
			const gotoFeatureJson: GeoJSON.Feature<any> = {
				type: 'Feature',
				geometry: gotoPoint,
				properties: {}
			};
			return this.setEntities([{ id: 'goto', featureJson: gotoFeatureJson }]);
		}
		this.clearEntities();
		return Observable.of(true);
	}

	onDispose() {
		this.removeSingleClickEvent();
		super.onDispose();
	}
}
