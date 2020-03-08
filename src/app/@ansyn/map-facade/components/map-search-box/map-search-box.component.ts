import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import { GeocoderService } from '../../services/geocoder.service';
import { Point } from 'geojson';
import { Observable } from 'rxjs';
import { filter, retryWhen, switchMap, take, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

@Component({
	selector: 'ansyn-map-search-box',
	templateUrl: './map-search-box.component.html',
	styleUrls: ['./map-search-box.component.less']
})
@AutoSubscriptions()
export class MapSearchBoxComponent implements OnInit, OnDestroy {
	@Input() mapId: string;
	control = new FormControl();
	_communicator: CommunicatorEntity;
	autoCompleteWidth = 108;
	locations: { name: string, point: Point }[] = [];
	public error: string = null;
	loading: boolean;

	@AutoSubscription
	filteredLocations$: Observable<any> = this.control.valueChanges.pipe(
		tap(this.resetSearch.bind(this)),
		filter((value: string) => value.length >= 2),
		tap((value: string) => this.loading = true),
		switchMap((value: string) => this.geocoderService.getLocation$(value)),
		tap((allLocations: Array<any>) => {
			this.error = null;
			this.locations = allLocations.filter((loc, index) => index < 5);
			this.autoCompleteWidth = this.locations.reduce<number>((acc, next) => {
				return acc > next.name.length ? acc : next.name.length;
			}, 0) * 9;
			this.loading = false;
		}),
		retryWhen((err) => {
			return err.pipe(
				tap(error => {
					this.error = error ? error[0].name : '';
					this.autoCompleteWidth = (<string>this.error).length * 5;
					this.loading = false;
				})
			)
		})
	);

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				protected geocoderService: GeocoderService) {
	}

	resetSearch(point) {
		this.locations = [];
		this.error = null;
	}

	goToLocation(point) {
		if (this._communicator) {
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
		const value = this.control.value;
		let point;
		let index = this.locations.findIndex(loc => loc.name === value);
		if (index > -1) {
			point = this.locations[index].point;
		} else {
			const bestLocation = this.locations[0];
			point = bestLocation && bestLocation.point;
			this.control.setValue(bestLocation ? bestLocation.name : value);
		}
		this.goToLocation(point);
	}
}
