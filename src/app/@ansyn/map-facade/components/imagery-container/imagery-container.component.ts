import { Component, Input } from '@angular/core';
import { BackToWorldView, CaseMapState, Overlay } from '@ansyn/core';
import { Store } from '@ngrx/store';
import {
	ActiveImageryMouseEnter,
	ActiveImageryMouseLeave,
	SynchronizeMapsAction
} from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less']
})
export class ImageryContainerComponent {
	@Input() mapState: CaseMapState;
	@Input() active: boolean;
	@Input() showStatus: boolean;
	@Input() mapsAmount = 1;

	get overlay(): Overlay {
		return this.mapState.data.overlay;
	}

	constructor(protected store: Store<any>) {
	}

	backToWorldView() {
		this.store.dispatch(new BackToWorldView({ mapId: this.mapState.id }));
	}

	toggleMapSynchronization() {
		this.store.dispatch(new SynchronizeMapsAction({ mapId: this.mapState.id }));
	}

	mouseLeave() {
		if (this.active) {
			this.store.dispatch(new ActiveImageryMouseLeave());
		}
	}

	mouseEnter() {
		if (this.active) {
			this.store.dispatch(new ActiveImageryMouseEnter());
		}
	}
}
