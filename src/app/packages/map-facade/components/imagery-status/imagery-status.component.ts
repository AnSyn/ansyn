import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BackToWorldAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit {

	@Input() map_id;
	@Input() overlay;
	@Input() active;

	//if not active show button follow
	constructor(private store: Store<any>) { }

	ngOnInit() {
	}


	backToWorldView() {
		this.store.dispatch(new BackToWorldAction({ mapId: this.map_id}));
	}
}
