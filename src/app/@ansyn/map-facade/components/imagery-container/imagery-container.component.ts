import { Component, Inject, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActiveImageryMouseEnter, ActiveImageryMouseLeave, SynchronizeMapsAction } from '../../actions/map.actions';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Observable } from 'rxjs';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { AnnotationInteraction } from '@ansyn/core/models/visualizers/annotations.model';
import { map } from 'rxjs/internal/operators';

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
	) {}

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
