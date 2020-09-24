import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import { ImageryCommunicatorService, IMapSettings, MapOrientation } from '@ansyn/imagery';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { get as _get } from 'lodash'
import { map, tap, filter } from 'rxjs/operators';
import {
	SetMapOrientation,
	SetOverlaysFootprintActive,
	SetToastMessageAction,
	ToggleMapLayersAction
} from '../../actions/map.actions';
import { ENTRY_COMPONENTS_PROVIDER, IEntryComponentsEntities } from '../../models/entry-components-provider';
import { selectEnableCopyOriginalOverlayDataFlag } from '../../reducers/imagery-status.reducer';
import {
	selectActiveMapId,
	selectHideLayersOnMap,
	selectMapOrientation,
	selectMapsTotal, selectOverlaysFootprintActiveByMapId
} from '../../reducers/map.reducer';
import { getTimeFormat } from '../../utils/time';
import { TranslateService } from '@ngx-translate/core';
import { copyFromContent } from '../../utils/clipboard';

export const imageryStatusClassNameForExport = 'imagery-status';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ImageryStatusComponent implements OnInit, OnDestroy {
	@HostBinding(`class.${imageryStatusClassNameForExport}`) readonly _ = true;
	isMapLayersVisible = true;
	mapsAmount = 1;
	_map: IMapSettings;
	perspective: boolean;
	orientation: MapOrientation;
	overlaysFootprintActive: boolean;
	baseMapDescription = 'Base Map';
	formattedOverlayTime: string = null;
	@HostBinding('class.active') isActiveMap: boolean;
	@Input() isMinimalistViewMode: boolean;
	hideLayers: boolean;

	@AutoSubscription
	active$ = this.store$.pipe(
		select(selectActiveMapId),
		map((activeMapId) => activeMapId === this.mapId),
		tap((isActiveMap) => this.isActiveMap = isActiveMap)
	);
	@AutoSubscription
	mapsAmount$ = this.store$.pipe(
		select(selectMapsTotal),
		tap((mapsAmount) => this.mapsAmount = mapsAmount)
	);
	translatedOverlaySensorName = '';
	@Output() toggleMapSynchronization = new EventEmitter<void>();
	@Output() onMove = new EventEmitter<MouseEvent>();
	enableCopyOriginalOverlayData: boolean;
	@AutoSubscription
	copyOriginalOverlayDataFlag$ = this.store$.select(selectEnableCopyOriginalOverlayDataFlag).pipe(
		tap((enableCopyOriginalOverlayData) => this.enableCopyOriginalOverlayData = enableCopyOriginalOverlayData)
	);

	constructor(protected store$: Store<any>,
				protected communicators: ImageryCommunicatorService,
				protected translate: TranslateService,
				@Inject(ENTRY_COMPONENTS_PROVIDER) public entryComponents: IEntryComponentsEntities) {
	}

	@AutoSubscription
	getMapOrientation$ = () => this.store$.select(selectMapOrientation(this.mapId)).pipe(
		filter(Boolean),
		tap( (orientation: MapOrientation) => {
			this.orientation = orientation;
			this.perspective = this.orientation === 'User Perspective';
		})
	);

	@AutoSubscription
	getOverlaysFootprint = () => this.store$.select(selectOverlaysFootprintActiveByMapId(this.mapId)).pipe(
		tap( isActive => this.overlaysFootprintActive = isActive)
	);


	get map() {
		return this._map;
	}

	@Input()
	set map(value: IMapSettings) {
		this._map = value;
		this.formattedOverlayTime = this.overlay ? this.getFormattedTime(this.overlay.photoTime) : null;
		this.translate.get(this.overlay && this.overlay.sensorName || 'unknown')
			.subscribe(translatedOverlaySensorName => this.translatedOverlaySensorName = translatedOverlaySensorName);
	}

	// @TODO: eject to ansyn
	get overlay() {
		return this.map && this.map.data && (<any>this.map.data).overlay;
	}

	get mapId() {
		return this.map && this.map.id;
	}

	@HostBinding('class.one-map')
	get oneMap() {
		return this.mapsAmount === 1;
	}

	get overlayTimeDate() {
		const ActiveMap = _get(this.communicators.provide(this.mapId), 'ActiveMap');
		const { description } = (ActiveMap && ActiveMap.getExtraData()) || <any>{};
		return description ? description : this.overlay ? this.formattedOverlayTime : null;
	}

	// @todo refactor
	get overlayDescription() {
		if (!this.overlay) {
			return this.baseMapDescription;
		}
		const catalogId = (<any>this.overlay).catalogID ? (' catalogId ' + (<any>this.overlay).catalogID) : '';
		return `${ this.translatedOverlaySensorName } ${ this.overlayTimeDate } ${ catalogId }`;
	}

	// @todo refactor
	get noGeoRegistration() {
		if (!this.overlay) {
			return false;
		}
		return this.overlay.isGeoRegistered === 'notGeoRegistered';
	}

	@AutoSubscription
	hideLayers$ = () => this.store$.pipe(
		select(selectHideLayersOnMap(this.mapId)),
		tap(hideLayers => this.hideLayers = hideLayers)
	);

	getFormattedTime(dateTimeSring: string): string {
		return getTimeFormat(new Date(dateTimeSring));
	}

	copyOverlayDescription() {
		if (this.enableCopyOriginalOverlayData && this.overlay.tag) {
			const tagJson = JSON.stringify(this.overlay.tag);
			copyFromContent(tagJson).then(() => this.store$.dispatch(new SetToastMessageAction({ toastText: 'Overlay original data copied to clipboard' })));
		} else {
			copyFromContent(this.overlayDescription).then(() => this.store$.dispatch(new SetToastMessageAction({ toastText: 'Overlay description copied to clipboard' })));
		}
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	toggleMapLayers() {
		this.isMapLayersVisible = !this.isMapLayersVisible;
		this.store$.dispatch(new ToggleMapLayersAction({ mapId: this.mapId, isVisible: this.isMapLayersVisible }));
	}

	toggleImageryPerspective() {
		const newMapOrientation = this.orientation === 'Imagery Perspective' ? 'User Perspective' : 'Imagery Perspective';
		this.store$.dispatch(new SetMapOrientation({orientation: newMapOrientation, mapId: this.mapId}));
	}

	toggleOverlaysFootprint() {
		const isDisplay = !this.overlaysFootprintActive;
		this.store$.dispatch(new SetOverlaysFootprintActive({mapId: this.mapId, show: isDisplay}));
	}
}
