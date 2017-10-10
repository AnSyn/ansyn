import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BackToWorldAction, SynchronizeMapsAction } from '../../../map-facade/actions/map.actions';
import { FavoriteAction } from '../../../status-bar/actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { CaseMapState } from '../../models/case.model';
import { IMapState } from '../../../map-facade/reducers/map.reducer';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})

export class ImageryStatusComponent implements OnInit {
	@Input() disableGeoOptions: boolean;
	@Input() notInCase: boolean;
	@Input() map_id = null;
	@Input() overlay;
	@Input() active;

	public mapsList$: Observable<CaseMapState[]> = (<Observable<IMapState>>this.store.select('map'))
		.pluck<IMapState, CaseMapState[]>('mapsList')
		.distinctUntilChanged();
	mapsList: CaseMapState[];

	constructor(private store: Store<any>) {

	}

	ngOnInit() {
		this.mapsList$.subscribe((mapsList: CaseMapState[]) => this.mapsList = mapsList);
	}

	backToWorldView() {
		this.store.dispatch(new BackToWorldAction({ mapId: this.map_id }));
	}

	toggleMapSynchronization() {
		if (!this.disableGeoOptions) {
			this.store.dispatch(new SynchronizeMapsAction({ mapId: this.map_id }));
		}
	}

	toggleFavorite() {
		this.store.dispatch(new FavoriteAction());
	}
}
