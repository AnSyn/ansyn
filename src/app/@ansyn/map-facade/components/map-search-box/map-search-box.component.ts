import { Component, Input, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import { GeocoderService } from '../../services/geocoder.service';
import { Point } from 'geojson';
import { Observable } from 'rxjs';
import { filter, retryWhen, switchMap, take, tap, delay } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectIsMinimalistViewMode } from "../../reducers/map.reducer";
import { Store } from "@ngrx/store";
const DEFAULT_WIDTH = 150;
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
	autoCompleteWidth = DEFAULT_WIDTH;
	locations: { name: string, point: Point }[] = [];
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
		tap((allLocations: Array<any>) => {
			this.locations = allLocations.slice(0, 10);
			const newAutoCompleteWidth = this.locations.reduce<number>((acc, next) => {
				return acc > next.name.length ? acc : next.name.length;
			}, 0) * 9;
			this.autoCompleteWidth = this.autoCompleteWidth < newAutoCompleteWidth ? newAutoCompleteWidth : this.autoCompleteWidth;
			this.loading = false;
		}),
		retryWhen((err) => {
			return err.pipe(
				tap(error => {
					this.error = true;
					this.autoCompleteWidth = DEFAULT_WIDTH;
					this.locations = [];
					this.loading = false;
				})
			)
		})
	);

	constructor(protected store$: Store<any>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				public geocoderService: GeocoderService) {
	}

	resetSearch() {
		this.locations = [];
		this.error = null;
		this.loading = true;
		this.autoCompleteWidth = DEFAULT_WIDTH;
	}

	goToLocation(point) {
		if (!this._communicator) {
			this._communicator = this.imageryCommunicatorService.provide(this.mapId);
		}
		if (point) {
			this._communicator.setCenter(point, true).pipe(take(1)).subscribe();
		}
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	onSubmit() {
		const value: string = this.control.value;
		let point;
		if (this.geocoderService.isCoordinates(value)) {
			point = this.geocoderService.createPoint(value);
		}
		else {
			let index = this.locations.findIndex(loc => loc.name === value);
			if (index > -1) {
				point = this.locations[index].point;
			} else {
				const bestLocation = this.locations[0];
				point = bestLocation && bestLocation.point;
				this.control.setValue(bestLocation ? bestLocation.name : value);
			}
		}
		this.goToLocation(point);
	}
}
