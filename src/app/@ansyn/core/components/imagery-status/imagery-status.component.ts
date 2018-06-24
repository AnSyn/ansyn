import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Overlay } from '../../models/overlay.model';
import { Store } from '@ngrx/store';
import { BackToWorldView, ToggleFavoriteAction, ToggleMapLayersAction } from '../../actions/core.actions';
import { coreStateSelector, ICoreState } from '../../reducers/core.reducer';
import { Observable } from 'rxjs';
import { AlertMsg } from '../../reducers/core.reducer';
import { Subscription } from 'rxjs/Subscription';
import { getTimeFormat } from '@ansyn/core/utils/time';
import { ALERTS, IAlert } from '@ansyn/core/alerts/alerts.model';
import { distinctUntilChanged, pluck, tap } from 'rxjs/internal/operators';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit, OnDestroy {
	_overlay: Overlay;

	@HostBinding('class.active') @Input() active: boolean;
	@Input() mapId: string = null;
	@Input() mapsAmount = 1;
	@Input() layerFlag = false;
	@Input() set overlay(overlay: Overlay) {
		this._overlay = overlay;
		this.updateFavoriteStatus();
	};
	get overlay() {
		return this._overlay;
	}

	@Output() toggleMapSynchronization = new EventEmitter<void>();

	private _subscriptions: Subscription[] = [];
	core$: Observable<ICoreState> = this.store$.select(coreStateSelector);
	favoriteOverlays$: Observable<Overlay[]> = this.core$.pluck<ICoreState, Overlay[]>('favoriteOverlays');

	alertMsg: AlertMsg;

	alertMsg$: Observable<AlertMsg> = this.core$
		.pipe(
			pluck<ICoreState, AlertMsg>('alertMsg'),
			tap((alertMsg) => this.alertMsg = alertMsg),
			distinctUntilChanged()
		)

	favoriteOverlays: Overlay[];
	isFavorite: boolean;
	favoritesButtonText: string;

	getFormattedTime(dateTimeSring: string): string {
		const formatedTime: string = getTimeFormat(new Date(this.overlay.photoTime));
		return formatedTime;
	}

	get description() {
		return (this.overlay && this.overlay) ? this.getFormattedTime(this.overlay.photoTime) + ' ' + this.overlay.sensorName : null;
	}

	get noGeoRegistration() {
		if (!this.overlay) {
			return false
		}
		return !this.overlay.isGeoRegistered;
	}

	constructor(protected store$: Store<any>, @Inject(ALERTS) public alerts: IAlert[]) {
	}

	ngOnInit(): void {
		this._subscriptions.push(
			this.favoriteOverlays$.subscribe((favoriteOverlays) => {
				this.favoriteOverlays = favoriteOverlays;
				this.updateFavoriteStatus();
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

	updateFavoriteStatus() {
		this.isFavorite = false;
		if (this.overlay && this.favoriteOverlays && this.favoriteOverlays.length > 0) {
			this.isFavorite = this.favoriteOverlays.some(o => o.id === this.overlay.id);
		}
		this.favoritesButtonText = this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
	}

	toggleMapLayers() {
		this.layerFlag = !this.layerFlag;
		this.store$.dispatch(new ToggleMapLayersAction({ mapId: this.mapId }));
	}

	backToWorldView() {
		this.store$.dispatch(new BackToWorldView({ mapId: this.mapId }))
	}
}
