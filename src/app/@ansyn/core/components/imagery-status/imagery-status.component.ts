import { Component, EventEmitter, HostBinding, Inject, Input, OnInit, Output } from '@angular/core';
import { Overlay } from '../../models/overlay.model';
import { Store } from '@ngrx/store';
import { ToggleFavoriteAction, ToggleMapLayersAction } from '../../actions/core.actions';
import { coreStateSelector, ICoreState } from '../../reducers/core.reducer';
import 'rxjs/add/operator/pluck';
import { Observable } from 'rxjs/Observable';
import { AlertMsg, AlertMsgTypes } from '../../reducers';
import { CoreConfig, ICoreConfig } from '../../models/index';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit {
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

	@Output() backToWorldView = new EventEmitter<void>();
	@Output() toggleMapSynchronization = new EventEmitter<void>();

	core$: Observable<ICoreState> = this.store$.select(coreStateSelector);
	favoriteOverlays$: Observable<Overlay[]> = this.core$.pluck<ICoreState, Overlay[]>('favoriteOverlays');

	alertMsg$: Observable<AlertMsg> = this.core$
		.pluck<ICoreState, AlertMsg>('alertMsg')
		.distinctUntilChanged();

	overlaysOutOfBounds$: Observable<boolean> = this.alertMsg$
		.map(alertMsg => alertMsg.get(AlertMsgTypes.OverlaysOutOfBounds).has(this.mapId));

	overlayIsNotPartOfCase$: Observable<boolean> = this.alertMsg$
		.map(alertMsg => alertMsg.get(AlertMsgTypes.OverlayIsNotPartOfCase).has(this.mapId));


	favoriteOverlays: Overlay[];
	isFavorite: boolean;
	favoritesButtonText: string;

	get description() {
		return (this.overlay && this.overlay) ? new Date(this.overlay.photoTime).toUTCString() + ' - ' + this.overlay.sensorName : null;
	}

	get isNotGeoRegistered() {
		return !MapFacadeService.isOverlayGeoRegistered(this.overlay);
	}

	constructor(protected store$: Store<any>, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
	}

	ngOnInit(): void {
		this.favoriteOverlays$.subscribe((favoriteOverlays) => {
			this.favoriteOverlays = favoriteOverlays;
			this.updateFavoriteStatus();
		});
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
}
