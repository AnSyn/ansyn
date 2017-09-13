import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BackToWorldAction, SynchronizeMapsAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})

export class ImageryStatusComponent {
	@Input() disableGeoOptions: boolean;
	@Input() notInCase: boolean;
	@Input() map_id;
	@Input() overlay;
	@Input() active;

	constructor(private store: Store<any>) {
	}

	backToWorldView($event) {
		$event.stopPropagation();
		this.store.dispatch(new BackToWorldAction({ mapId: this.map_id }));
	}

	toggleMapSynchronization() {
		if (!this.disableGeoOptions) {
			this.store.dispatch(new SynchronizeMapsAction({ mapId: this.map_id }));
		}
	}
}
