import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Overlay } from '../../models/overlay.model';
import { Store } from '@ngrx/store';
import { ToggleFavoriteAction, ToggleMapLayersAction } from '../../actions/core.actions';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent {
	@HostBinding('class.active') @Input() active: boolean;
	@Input() disableGeoOptions: boolean;
	@Input() notInCase: boolean;
	@Input() mapId: string = null;
	@Input() overlay: Overlay;
	@Input() mapsAmount = 1;
	@Input() isFavoriteOverlayDisplayed = false;
	@Input() layerFlag = false;

	@Output() backToWorldView = new EventEmitter<void>();
	@Output() toggleMapSynchronization = new EventEmitter<void>();

	constructor(protected store: Store<any>) {
	}

	toggleFavorite() {
		this.store.dispatch(new ToggleFavoriteAction(this.overlay.id));
	}

	toggleMapLayers() {
		this.store.dispatch(new ToggleMapLayersAction({ mapId: this.mapId }));
	}
}
