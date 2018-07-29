import { Component, Input, OnDestroy } from '@angular/core';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { GeocoderService } from '@ansyn/map-facade/services/geocoder.service';
import { Point } from 'geojson';
import { Subscription } from 'rxjs';

@Component({
	selector: 'ansyn-map-search-box',
	templateUrl: './map-search-box.component.html',
	styleUrls: ['./map-search-box.component.less']
})
export class MapSearchBoxComponent implements OnDestroy {
	@Input() mapId: string;

	searchString: string;
	_communicator: CommunicatorEntity;
	private _subscriptions: Subscription[] = [];
	public error: boolean;

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				protected geocoderService: GeocoderService) {
		this.reset();
		this.resetError();
	}

	reset() {
		this.searchString = '';
	}

	resetError() {
		this.error = false;
	}

	onSubmit() {
		if (! this._communicator) {
			this._communicator = this.imageryCommunicatorService.provide(this.mapId);
		}
		if (!this._communicator || !this.searchString) {
			return;
		}
		this._subscriptions.push(
			this.geocoderService.getLocation$(this.searchString)
				.do((point: Point) => {
						if (point) {
							this._subscriptions.push(this._communicator.setCenter(point, false).take(1).subscribe())
						} else {
							this.error = true;
						}
					}
				)
				.take(1).subscribe())
		;
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(sub => sub.unsubscribe());
	}

}
