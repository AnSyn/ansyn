import { Component, Input, OnDestroy } from '@angular/core';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { GeocoderService } from '@ansyn/core/services/geocoder.service';
import { Point } from 'geojson';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'ansyn-map-search-box',
	templateUrl: './map-search-box.component.html',
	styleUrls: ['./map-search-box.component.less']
})
export class MapSearchBoxComponent implements OnDestroy {
	@Input() mapId: string;

	searchString: string;
	communicator: CommunicatorEntity;
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
		if (!this.searchString) {
			return;
		}
		this.communicator = this.imageryCommunicatorService.provide(this.mapId);
		this._subscriptions.push(
			this.geocoderService.getLocation$(this.searchString)
				.do((point: Point) => {
						if (point) {
							this._subscriptions.push(this.communicator.setCenter(point).take(1).subscribe())
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
