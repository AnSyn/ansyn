import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActiveImageryMouseEnter, ActiveImageryMouseLeave, SynchronizeMapsAction } from '../../actions/map.actions';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Observable } from 'rxjs';

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

	isHidden$: Observable<boolean> = this.store.select(mapStateSelector)
		.map((mapState: IMapState) => mapState.isHiddenMaps.has(this.mapState.id));

	get overlay(): Overlay {
		return this.mapState.data.overlay;
	}

	constructor(protected store: Store<any>) {
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
