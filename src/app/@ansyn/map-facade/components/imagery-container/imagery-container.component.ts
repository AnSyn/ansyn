import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { ImageryMouseEnter, ImageryMouseLeave, SynchronizeMapsAction } from '../../actions/map.actions';
import { IMapSettings } from '@ansyn/imagery';
import { IMapState, mapStateSelector } from '../../reducers/map.reducer';
import { Observable } from 'rxjs';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { map } from 'rxjs/operators';
import { ENTRY_COMPONENTS_PROVIDER, IEntryComponentsEntities } from '../../models/entry-components-provider';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less']
})
export class ImageryContainerComponent {
	@Input() mapState: IMapSettings;
	@Input() active: boolean;
	@Input() showStatus: boolean;
	@Input() mapsAmount = 1;
	@Output() onMove = new EventEmitter<void>();
	isInImagery = false;
	isHidden$: Observable<boolean> = this.store.select(mapStateSelector).pipe(
		map((mapState: IMapState) => mapState.isHiddenMaps.has(this.mapState.id))
	);

	get overlay(): any {
		return this.mapState.data.overlay;
	}

	constructor(protected store: Store<any>,
				@Inject(ENTRY_COMPONENTS_PROVIDER) public entryComponents: IEntryComponentsEntities,
				@Inject(mapFacadeConfig) public packageConfig: IMapFacadeConfig
	) {
	}

	toggleMapSynchronization() {
		this.store.dispatch(new SynchronizeMapsAction({ mapId: this.mapState.id }));
	}

	mouseLeave() {
		this.isInImagery = false;
		this.store.dispatch(new ImageryMouseLeave(this.mapState.id));
	}

	mouseEnter() {
		this.isInImagery = true;
		this.store.dispatch(new ImageryMouseEnter(this.mapState.id));
	}
}
