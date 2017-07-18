import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BackToWorldAction, SynchronizeMapsAction, ToggleHistogramAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit {

	@Input() map_id;
	@Input() overlay;
	@Input() active;

	histogramActive = false;
	
	//if not active show button follow
	constructor(private store: Store<any>) { }

	ngOnInit() {
	}


	backToWorldView() {
		this.store.dispatch(new BackToWorldAction({ mapId: this.map_id}));
	}

	toggleMapSyncroniztion() {
		this.store.dispatch(new SynchronizeMapsAction(null));
	}

	toggleHistogramEqualization() {
		this.histogramActive = !this.histogramActive;
		this.store.dispatch(new ToggleHistogramAction({ mapId: this.map_id}));
	}
}
