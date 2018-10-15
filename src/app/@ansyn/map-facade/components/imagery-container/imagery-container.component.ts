import { Component, Inject, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActiveImageryMouseEnter, ActiveImageryMouseLeave, SynchronizeMapsAction } from '../../actions/map.actions';
import { AnnotationInteraction, ICaseMapState, IOverlay } from '@ansyn/core';
import { IMapState, mapStateSelector } from '../../reducers/map.reducer';
import { Observable } from 'rxjs';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { map } from 'rxjs/operators';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less']
})
export class ImageryContainerComponent {
	@Input() mapState: ICaseMapState;
	@Input() active: boolean;
	@Input() showStatus: boolean;
	@Input() mapsAmount = 1;

	isHidden$: Observable<boolean> = this.store.select(mapStateSelector).pipe(
		map((mapState: IMapState) => mapState.isHiddenMaps.has(this.mapState.id))
	);

	get overlay(): IOverlay {
		return this.mapState.data.overlay;
	}

	get AnnotationInteraction() {
		return AnnotationInteraction;
	}

	constructor(protected store: Store<any>,
				@Inject(mapFacadeConfig) public packageConfig: IMapFacadeConfig
	) {
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
