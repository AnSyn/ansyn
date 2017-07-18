import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { Store } from '@ngrx/store';
import { BackToWorldAction, SynchronizeMapsAction, ToggleHistogramAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnChanges  {

	@Input() map_id;
	@Input() overlay;
	@Input() active;

	histogramActive = false;
	
	//if not active show button follow
	constructor(private store: Store<any>) { }

	ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
		if(changes["overlay"].currentValue !== changes["overlay"].previousValue) {
			this.histogramActive = false;
		}
	}


	backToWorldView() {
		this.histogramActive = false;
		this.store.dispatch(new BackToWorldAction({ mapId: this.map_id}));
	}

	toggleMapSyncroniztion() {
		this.store.dispatch(new SynchronizeMapsAction(null));
	}

	toggleHistogramEqualization() {
		this.histogramActive = !this.histogramActive;
		this.store.dispatch(new ToggleHistogramAction({shouldPerform: this.histogramActive, mapId: this.map_id}));		
	}
}
