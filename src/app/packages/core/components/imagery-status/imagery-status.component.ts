import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { Overlay } from '../../models/overlay.model';
import { Store } from '@ngrx/store';
import { ToggleFavoriteAction, ToggleMapLayersAction } from '../../actions/core.actions';
import { coreStateSelector, ICoreState } from '../../reducers/core.reducer';
import 'rxjs/add/operator/pluck';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit {
	@HostBinding('class.active') @Input() active: boolean;
	@Input() disableGeoOptions: boolean;
	@Input() notInCase: boolean;
	@Input() mapId: string = null;
	@Input() overlay: Overlay;
	@Input() mapsAmount = 1;
	@Input() layerFlag = false;
	@Output() backToWorldView = new EventEmitter<void>();
	@Output() toggleMapSynchronization = new EventEmitter<void>();

	core$: Observable<ICoreState> = this.store$.select(coreStateSelector);
	favoriteOverlays$: Observable<Overlay[]> = this.core$.pluck<ICoreState, Overlay[]>('favoriteOverlays');
	favoriteOverlays: Overlay[];

	constructor(protected store$: Store<any>) {
	}

	isFavoriteOverlayDisplayed() {
		return this.favoriteOverlays.some(o => o.id === this.overlay.id);
	}

	ngOnInit(): void {
		this.favoriteOverlays$.subscribe((favoriteOverlays) => this.favoriteOverlays = favoriteOverlays);
	}

	toggleFavorite() {
		this.store$.dispatch(new ToggleFavoriteAction(this.overlay));
	}

	toggleMapLayers() {
		this.store$.dispatch(new ToggleMapLayersAction({ mapId: this.mapId }));
	}
}
