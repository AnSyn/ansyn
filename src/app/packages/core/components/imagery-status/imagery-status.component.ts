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
	@HostBinding('class.active') @Input() active: boolean;
	@Input() mapId: string = null;
	@Input() overlay: Overlay;
	@Input() mapsAmount = 1;
	@Input() layerFlag = false;
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


	get description() {
		return (this.overlay && this.overlay) ? new Date(this.overlay.photoTime).toUTCString() + ' - ' + this.overlay.sensorName : null;
	}

	get isNotGeoRegistered() {
		return !MapFacadeService.isOverlayGeoRegistered(this.overlay);
	}

	constructor(protected store$: Store<any>, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
	}

	isFavoriteOverlayDisplayed() {
		return this.favoriteOverlays.some(o => o.id === this.overlay.id);
	}

	ngOnInit(): void {
		this.favoriteOverlays$.subscribe((favoriteOverlays) => this.favoriteOverlays = favoriteOverlays);
	}

	toggleFavorite() {
		this.store$.dispatch(new ToggleFavoriteAction(this.overlay));
	}

	toggleMapLayers() {
		this.layerFlag = !this.layerFlag;
		this.store$.dispatch(new ToggleMapLayersAction({ mapId: this.mapId }));
	}
}
