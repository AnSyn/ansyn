import {
	Component,
	EventEmitter,
	HostBinding,
	HostListener,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { GeoRegisteration, IOverlay } from '@ansyn/imagery';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getTimeFormat } from '../../utils/time';
import { ALERTS, IAlert } from '../../alerts/alerts.model';
import { distinctUntilChanged, tap } from 'rxjs/internal/operators';
import { TranslateService } from '@ngx-translate/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import {
	BackToWorldView,
	ChangeImageryMap,
	SetToastMessageAction,
	ToggleMapLayersAction
} from '../../actions/map.actions';
import { selectAlertMsg } from '../../reducers/map.reducer';
import { AlertMsg } from '../../alerts/model';
import {
	selectEnableCopyOriginalOverlayDataFlag,
	selectFavoriteOverlays,
	selectPresetOverlays,
	selectRemovedOverlays
} from '../../reducers/imagery-status.reducer';
import { SetRemovedOverlaysIdAction } from '../../actions/imagery-status.actions';

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
	_overlay: IOverlay;
	selectedMap = 'openLayersMap';

	@HostBinding('class.active') @Input() active: boolean;

	@Input() mapId: string = null;
	@Input() mapsAmount = 1;

	@HostBinding('class.one-map')
	get oneMap() {
		return this.mapsAmount === 1;
	}

	@Input() layerFlag = false;

	@Input() set overlay(overlay: IOverlay) {
		this._overlay = overlay;
		if (!this._overlay) {
			this.translatedOverlaySensorName = '';
		} else {
			if (this.overlay.sensorName) {
				this.translate.get(this.overlay.sensorName).subscribe((res: string) => {
					this.translatedOverlaySensorName = res;
				});
			}
		}
		this.updateRemovedStatus();
		this.updateFavoriteStatus();
		this.updatePresetStatus();

	};

	translatedOverlaySensorName = '';

	get overlay() {
		return this._overlay;
	}

	@Output() toggleMapSynchronization = new EventEmitter<void>();
	@Output() onMove = new EventEmitter<MouseEvent>();

	@AutoSubscription
	favoriteOverlays$: Observable<IOverlay[]> = this.store$.select(selectFavoriteOverlays).pipe(
		tap((favoriteOverlays) => {
			this.favoriteOverlays = favoriteOverlays;
			this.updateFavoriteStatus();
		})
	);

	@AutoSubscription
	presetOverlays$: Observable<IOverlay[]> = this.store$.select(selectPresetOverlays).pipe(
		tap((presetOverlays) => {
			this.presetOverlays = presetOverlays;
			this.updatePresetStatus();
		})
	);

	@AutoSubscription
	removedOverlays$: Observable<string[]> = this.store$.select(selectRemovedOverlays).pipe(
		tap((removedOverlaysIds) => {
			this.removedOverlaysIds = removedOverlaysIds;
			this.updateRemovedStatus();
		})
	);

	alertMsg: AlertMsg;
	enableCopyOriginalOverlayData: boolean;

	@AutoSubscription
	alertMsg$: Observable<AlertMsg> = this.store$
		.pipe(
			select(selectAlertMsg),
			tap((alertMsg) => this.alertMsg = alertMsg),
			distinctUntilChanged()
		);

	@AutoSubscription
	copyOriginalOverlayDataFlag$ = this.store$.select(selectEnableCopyOriginalOverlayDataFlag).pipe(
		tap((enableCopyOriginalOverlayData) => this.enableCopyOriginalOverlayData = enableCopyOriginalOverlayData)
	);

	favoriteOverlays: IOverlay[];
	isFavorite: boolean;
	removedOverlaysIds = [];

	favoritesButtonText: string;

	presetOverlays: IOverlay[];
	isPreset: boolean;
	presetsButtonText: string;
	isRemoved: boolean;

	@HostListener('window:keydown', ['$event'])
	deleteKeyPressed($event: KeyboardEvent) {
		if (this.active && this.overlay && $event.which === 46 && !this.isRemoved) {
			this.removeOverlay();
		}
	}

	getFormattedTime(dateTimeSring: string): string {
		const formatedTime: string = getTimeFormat(new Date(this.overlay.photoTime));
		return formatedTime;
	}

	get description() {
		return (this.overlay && this.overlay) ? this.getFormattedTime(this.overlay.photoTime) : null;
	}

	get baseMapDescription() {
		return 'Base Map';
	}

	get overlayDescription() {
		if (!this.overlay) {
			return this.baseMapDescription;
		}
		const catalogId = (<any>this.overlay).catalogID ? (' catalogId ' + (<any>this.overlay).catalogID) : '';
		return `${this.description} ${this.translatedOverlaySensorName}${catalogId}`;
	}

	copyOverlayDescription() {
		if (this.enableCopyOriginalOverlayData && this._overlay.tag) {
			const tagJson = JSON.stringify(this._overlay.tag);
			// copyFromContent(tagJson);
			this.store$.dispatch(new SetToastMessageAction({ toastText: 'Overlay original data copied to clipboard' }));
		} else {
			// copyFromContent(this.overlayDescription);
			this.store$.dispatch(new SetToastMessageAction({ toastText: 'Overlay description copied to clipboard' }));
		}
	}

	get noGeoRegistration() {
		if (!this.overlay) {
			return false;
		}
		return this.overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered;
	}

	get poorGeoRegistered() {
		if (!this.overlay) {
			return false;
		}
		return this.overlay.isGeoRegistered === GeoRegisteration.poorGeoRegistered;
	}

	constructor(protected store$: Store<any>,
				@Inject(ALERTS) public alerts: IAlert[],
				protected translate: TranslateService) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	showAlert(alertKey) {
		const ids = this.alertMsg.get(alertKey);
		if (ids) {
			return ids.has(this.mapId);
		} else {
			return this[alertKey];
		}
	}

	toggleFavorite() {
		const overlay = this.overlay;
		const { id } = overlay;
		const value = !this.isFavorite;
		// this.store$.dispatch(new ToggleFavoriteAction({ value, id, overlay }));
	}

	togglePreset() {
		const overlay = this.overlay;
		const { id } = overlay;
		const value = !this.isPreset;
		// this.store$.dispatch(new TogglePresetOverlayAction({ value, id, overlay }));
	}

	updateFavoriteStatus() {
		this.isFavorite = false;
		if (this.overlay && this.favoriteOverlays && this.favoriteOverlays.length > 0) {
			this.isFavorite = this.favoriteOverlays.some(o => o.id === this.overlay.id);
		}
		this.favoritesButtonText = this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
	}

	updatePresetStatus() {
		this.isPreset = false;
		if (this.overlay && this.presetOverlays && this.presetOverlays.length > 0) {
			this.isPreset = this.presetOverlays.some(o => o.id === this.overlay.id);
		}
		this.presetsButtonText = this.isPreset ? 'Remove from overlays quick loop' : 'Add to overlays quick loop';
	}

	updateRemovedStatus() {
		this.isRemoved = this.removedOverlaysIds.includes(this.overlay && this.overlay.id);
	}

	toggleMapLayers() {
		this.layerFlag = !this.layerFlag;
		this.store$.dispatch(new ToggleMapLayersAction({ mapId: this.mapId }));
	}

	backToWorldView() {
		this.store$.dispatch(new BackToWorldView({ mapId: this.mapId }));
	}

	removeOverlay() {
		this.store$.dispatch(new SetRemovedOverlaysIdAction({
			mapId: this.mapId,
			id: this.overlay.id,
			value: !this.isRemoved
		}));
	}

	changeActiveMap(mapType: string) {
		this.store$.dispatch(new ChangeImageryMap({ id: this.mapId, mapType }));
	}
}
