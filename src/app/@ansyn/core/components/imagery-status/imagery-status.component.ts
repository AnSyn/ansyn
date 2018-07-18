import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IOverlay } from '../../models/overlay.model';
import { Store } from '@ngrx/store';
import {
	BackToWorldView,
	ToggleFavoriteAction,
	ToggleMapLayersAction,
	TogglePresetAction
} from '../../actions/core.actions';
import {
	AlertMsg,
	coreStateSelector,
	ICoreState,
	selectFavoriteOverlays,
	selectPresetOverlays
} from '../../reducers/core.reducer';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { getTimeFormat } from '../../utils/time';
import { ALERTS, IAlert } from '../../alerts/alerts.model';
import { distinctUntilChanged, pluck, tap } from 'rxjs/internal/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit, OnDestroy {
	_overlay: IOverlay;

	@HostBinding('class.active') @Input() active: boolean;
	@Input() mapId: string = null;
	@Input() mapsAmount = 1;
	@Input() layerFlag = false;

	@Input() set overlay(overlay: IOverlay) {
		this._overlay = overlay;
		this.updateFavoriteStatus();
		this.updatePresetStatus();
	};

	get overlay() {
		return this._overlay;
	}

	@Output() toggleMapSynchronization = new EventEmitter<void>();

	private _subscriptions: Subscription[] = [];
	core$: Observable<ICoreState> = this.store$.select(coreStateSelector);
	favoriteOverlays$: Observable<IOverlay[]> = this.store$.select(selectFavoriteOverlays);
	presetOverlays$: Observable<IOverlay[]> = this.store$.select(selectPresetOverlays);

	alertMsg: AlertMsg;

	alertMsg$: Observable<AlertMsg> = this.core$
		.pipe(
			pluck<ICoreState, AlertMsg>('alertMsg'),
			tap((alertMsg) => this.alertMsg = alertMsg),
			distinctUntilChanged()
		);

	favoriteOverlays: IOverlay[];
	isFavorite: boolean;
	favoritesButtonText: string;

	presetOverlays: IOverlay[];
	isPreset: boolean;
	presetsButtonText: string;

	getFormattedTime(dateTimeSring: string): string {
		const formatedTime: string = getTimeFormat(new Date(this.overlay.photoTime));
		return formatedTime;
	}

	get description() {
		return (this.overlay && this.overlay) ? this.getFormattedTime(this.overlay.photoTime) : null;
	}

	get noGeoRegistration() {
		if (!this.overlay) {
			return false;
		}
		return !this.overlay.isGeoRegistered;
	}

	constructor(protected store$: Store<any>,
				@Inject(ALERTS) public alerts: IAlert[],
				protected translate: TranslateService) {
	}

	ngOnInit(): void {
		this._subscriptions.push(
			this.favoriteOverlays$.subscribe((favoriteOverlays) => {
				this.favoriteOverlays = favoriteOverlays;
				this.updateFavoriteStatus();
			}),
			this.presetOverlays$.subscribe((presetOverlays) => {
				this.presetOverlays = presetOverlays;
				this.updatePresetStatus();
			}),
			this.alertMsg$.subscribe()
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
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
		this.store$.dispatch(new ToggleFavoriteAction(this.overlay));
	}

	togglePreset() {
		this.store$.dispatch(new TogglePresetAction(this.overlay));
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
		this.presetsButtonText = this.isPreset ? 'Remove from presets' : 'Add to presets';
	}

	toggleMapLayers() {
		this.layerFlag = !this.layerFlag;
		this.store$.dispatch(new ToggleMapLayersAction({ mapId: this.mapId }));
	}

	backToWorldView() {
		this.store$.dispatch(new BackToWorldView({ mapId: this.mapId }));
	}
}
