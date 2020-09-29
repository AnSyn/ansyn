import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import { GeocoderService } from '../../services/geocoder.service';
import { Observable } from 'rxjs';
import { filter, retryWhen, switchMap, take, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectIsMinimalistViewMode } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import {
	LogMapSearchBoxAction,
	SetActiveCenterTriggerAction,
	SetMapSearchBoxTriggerAction,
	SetToastMessageAction
} from '../../actions/map.actions';
import { TranslateService } from '@ngx-translate/core';
import { IMapSearchResult } from '../../models/map-search.model';

@Component({
	selector: 'ansyn-map-search-box',
	templateUrl: './map-search-box.component.html',
	styleUrls: ['./map-search-box.component.less']
})
@AutoSubscriptions()
export class MapSearchBoxComponent implements OnInit, OnDestroy {
	@Input() mapId: string;
	@HostBinding('class.hide') isMinimalView: boolean;
	control = new FormControl();
	_communicator: CommunicatorEntity;
	locations: IMapSearchResult[] = [];
	public error: boolean;
	loading: boolean;

	@AutoSubscription
	isMinimalistViewMode$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		tap(isMinimalistViewMode => {
			this.isMinimalView = isMinimalistViewMode;
		})
	);

	@AutoSubscription
	filteredLocations$: Observable<any> = this.control.valueChanges.pipe(
		tap(this.resetSearch.bind(this)),
		filter((value: string) => value.length >= 2),
		switchMap((value: string) => this.geocoderService.getLocation$(value)),
		tap((allLocations: Array<IMapSearchResult>) => {
			this.locations = allLocations.slice(0, 10);
			this.loading = false;
		}),
		retryWhen((err) => {
			return err.pipe(
				tap(() => {
					this.error = true;
					this.locations = [];
					this.loading = false;
				})
			)
		})
	);

	constructor(
		protected store$: Store<any>,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		public geocoderService: GeocoderService,
		protected translator: TranslateService
	) {
	}

	resetSearch() {
		this.locations = [];
		this.error = null;
		this.loading = true;
		if (!this.control.value) {
			this.store$.dispatch(new SetMapSearchBoxTriggerAction(false));
		}
	}

	goToLocation(point) {
		if (!this._communicator) {
			this._communicator = this.imageryCommunicatorService.provide(this.mapId);
		}
		if (point) {
			this._communicator.setCenter(point, true).pipe(take(1)).subscribe();
			this.store$.dispatch(new SetActiveCenterTriggerAction(point.coordinates));
			this.store$.dispatch(new SetMapSearchBoxTriggerAction(true));
		}
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	onSubmit() {
		const value: string = this.control.value;
		this.store$.dispatch(new LogMapSearchBoxAction(value));
		let point;
		if (this.geocoderService.isCoordinates(value)) {
			point = this.geocoderService.createPoint(value);
		} else {
			let index = this.locations.findIndex(loc => loc.name === value);
			if (index > -1) {
				point = this.locations[index].point;
			} else {
				const bestLocation = this.locations[0];
				point = bestLocation && bestLocation.point;
				this.control.setValue(bestLocation ? bestLocation.name : value);
			}
		}

		if (point) {
			this.goToLocation(point);
		} else {
			const toastText = this.translator.instant('Invalid location');
			this.store$.dispatch(new SetToastMessageAction({ toastText }))
		}
	}
}
