import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import { ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { get as _get } from 'lodash'
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SetToastMessageAction, ToggleMapLayersAction } from '../../actions/map.actions';
import { ENTRY_COMPONENTS_PROVIDER, IEntryComponentsEntities } from '../../models/entry-components-provider';
import { selectEnableCopyOriginalOverlayDataFlag } from '../../reducers/imagery-status.reducer';
import { selectActiveMapId, selectMaps, selectMapsTotal } from '../../reducers/map.reducer';
import { copyFromContent } from '../../utils/clipboard';
import { getTimeFormat } from '../../utils/time';

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
	_mapId: string;
	_entryComponents: IEntryComponentsEntities;
	@HostBinding('class.active') isActiveMap: boolean;
	@Input()
	set mapId(value: string) {
		this._mapId = value;
		/* force angular to rerender the *ngFor content that binding to this arrays
		 * so they get the new mapId	 */
		this._entryComponents = {status: [], container: []};
		setTimeout(() => this._entryComponents = {...this.entryComponents})
	}


	get mapId() {
		return this._mapId;
	}

	overlay: any; // @TODO: eject to ansyn
	displayLayers: boolean;
	@AutoSubscription
	overlay$: Observable<Dictionary<IMapSettings>> = this.store$.pipe(
		select(selectMaps),
		filter((maps) => Boolean(maps[this.mapId])),
		tap((maps) => {
			this.overlay = maps[this.mapId].data.overlay;
			this.displayLayers = maps[this.mapId].flags.displayLayers;
		})
	);

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

	@HostBinding('class.one-map')
	get oneMap() {
		return this.mapsAmount === 1;
	}

	translatedOverlaySensorName = '';

	@Output() toggleMapSynchronization = new EventEmitter<void>();
	@Output() onMove = new EventEmitter<MouseEvent>();

	enableCopyOriginalOverlayData: boolean;

	@AutoSubscription
	copyOriginalOverlayDataFlag$ = this.store$.select(selectEnableCopyOriginalOverlayDataFlag).pipe(
		tap((enableCopyOriginalOverlayData) => this.enableCopyOriginalOverlayData = enableCopyOriginalOverlayData)
	);

	getFormattedTime(dateTimeSring: string): string {
		const formatedTime: string = getTimeFormat(new Date(this.overlay.photoTime));
		return formatedTime;
	}

	get description() {
		const ActiveMap = _get(this.communicators.provide(this.mapId), 'ActiveMap');
		const { description } = (ActiveMap && ActiveMap.getExtraData()) || <any> {};
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
		return `${this.description} ${this.translatedOverlaySensorName}${catalogId}`;
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

	constructor(protected store$: Store<any>,
				protected communicators: ImageryCommunicatorService,
				@Inject(ENTRY_COMPONENTS_PROVIDER) public entryComponents: IEntryComponentsEntities) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	toggleMapLayers() {
		this.store$.dispatch(new ToggleMapLayersAction({mapId: this.mapId}));
	}
}
