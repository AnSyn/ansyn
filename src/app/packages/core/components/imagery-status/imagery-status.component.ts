import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Overlay } from '../../models/overlay.model';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent {
	@Input() disableGeoOptions: boolean;
	@Input() notInCase: boolean;
	@Input() mapId: string = null;
	@Input() overlay: Overlay;
	@Input() active: boolean;
	@Input() mapsAmount = 1;
	@Input() isFavoriteOverlayDisplayed = false;

	@Output() backToWorldView = new EventEmitter<void>();
	@Output() toggleMapSynchronization = new EventEmitter<void>();
	@Output() toggleFavorite = new EventEmitter<void>();
}
