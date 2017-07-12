import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BackToWorldAction, SynchronizeMapsAction, ToggleHistogramAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent  {

	@Input() map_id;
	@Input() overlay;
	@Input() active;
	@Input() histogramActive;

	constructor(private store: Store<any>) { }


	backToWorldView($event) {
		$event.stopPropagation();
		this.store.dispatch(new BackToWorldAction({ mapId: this.map_id}));
	}

	toggleMapSyncroniztion() {
		this.store.dispatch(new SynchronizeMapsAction(null));
	}

	toggleHistogramEqualization() {
		this.store.dispatch(new ToggleHistogramAction({mapId: this.map_id}));
	}
}
