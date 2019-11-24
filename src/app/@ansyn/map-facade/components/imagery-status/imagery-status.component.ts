import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import { ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { get as _get } from 'lodash'
import { map, tap } from 'rxjs/operators';
import { SetToastMessageAction, ToggleMapLayersAction } from '../../actions/map.actions';
import { ENTRY_COMPONENTS_PROVIDER, IEntryComponentsEntities } from '../../models/entry-components-provider';
import { selectEnableCopyOriginalOverlayDataFlag } from '../../reducers/imagery-status.reducer';
import { selectActiveMapId, selectHideLayersOnMap, selectMapsTotal } from '../../reducers/map.reducer';
import { copyFromContent } from '../../utils/clipboard';
import { getTimeFormat } from '../../utils/time';
import { TranslateService } from '@ngx-translate/core';

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
	mapsAmount = 1;
	_map: IMapSettings;
	_entryComponents: IEntryComponentsEntities;
	@HostBinding('class.active') isActiveMap: boolean;
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

	@Input()
	isMinimalistViewMode: boolean;

	constructor(protected store$: Store<any>,
				protected communicators: ImageryCommunicatorService,
				protected translate: TranslateService,
				@Inject(ENTRY_COMPONENTS_PROVIDER) public entryComponents: IEntryComponentsEntities) {
	}

	get map() {
		return this._map;
	}

	@Input()
	set map(value: IMapSettings) {
		this._map = value;
		/* force angular to rerender the *ngFor content that binding to this arrays
		 * so they get the new mapId	 */
		this._entryComponents = { status: [], container: [], floating_menu: [] };
		this.translate.get(this.overlay && this.overlay.sensorName || 'unknown')
			.subscribe(translatedOverlaySensorName => this.translatedOverlaySensorName = translatedOverlaySensorName);
		setTimeout(() => this._entryComponents = { ...this.entryComponents })
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
		return description ? description : this.overlay ? this.getFormattedTime(this.overlay.photoTime) : null;
	}

	get baseMapDescription() {
		return 'Base Map';
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

	// @todo refactor
	get poorGeoRegistered() {
		if (!this.overlay) {
			return false;
		}
		return this.overlay.isGeoRegistered === 'poorGeoRegistered';
	}

	@AutoSubscription
	hideLayers$ = () => this.store$.pipe(
		select(selectHideLayersOnMap(this.mapId)),
		tap(hideLayers => this.hideLayers = hideLayers)
	);

	getFormattedTime(dateTimeSring: string): string {
		return getTimeFormat(new Date(dateTimeSring));
	}

	// @todo refactor
	copyOverlayDescription() {
		if (this.enableCopyOriginalOverlayData && this.overlay.tag) {
			const tagJson = JSON.stringify(this.overlay.tag);
			copyFromContent(tagJson);
			this.store$.dispatch(new SetToastMessageAction({ toastText: 'Overlay original data copied to clipboard' }));
		} else {
			copyFromContent(this.overlayDescription);
			this.store$.dispatch(new SetToastMessageAction({ toastText: 'Overlay description copied to clipboard' }));
		}
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	toggleMapLayers() {
		this.store$.dispatch(new ToggleMapLayersAction({ mapId: this.mapId }));
	}
}
