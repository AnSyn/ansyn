import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { filter, take, tap } from 'rxjs/operators';
import { CommunicatorEntity, ImageryCommunicatorService, IMapInstanceChanged, IMousePointerMove } from '@ansyn/imagery';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { ICoordinatesSystem, ProjectionConverterService } from '../../services/projection-converter.service';

const wgs84: ICoordinatesSystem = {
	datum: 'wgs84',
	projection: 'geo'
};
const utm: ICoordinatesSystem = {
	datum: 'ed50',
	projection: 'utm'
};
const utmWgs84: ICoordinatesSystem = {
	datum: 'wgs84',
	projection: 'utm'
};

@Component({
	selector: 'ansyn-imagery-mouse-coordinates',
	templateUrl: './imagery-mouse-coordinates.component.html',
	styleUrls: ['./imagery-mouse-coordinates.component.less']
})
export class ImageryMouseCoordinatesComponent implements OnInit, OnDestroy {

	@Input() mapId;
	@Input() isVisible;
	mouseMovedEventSubscriber;
	communicator: CommunicatorEntity;
	floatingPositionSuffix = '';
	floationgSystem: string;

	lat: string;
	long: string;
	height: string;
	zone: string;

	constructor(protected communicators: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				protected projectionConverterService: ProjectionConverterService) {
		this.floatingPositionSuffix = this.config.floatingPositionSuffix || '';
		this.floationgSystem = this.config.floatingPositionSystem || 'WGS84';
	}

	registerMouseEvents() {
		this.mouseMovedEventSubscriber = this.communicator.ActiveMap.mousePointerMoved.subscribe((args: IMousePointerMove) => {

			const lat = !isNaN(args.lat) ? args.lat.toFixed(5) : null;
			const long = !isNaN(args.long) ? args.long.toFixed(5) : null;
			const height = !isNaN(args.height) ? args.height.toFixed(2) : null;
			if (this.floationgSystem === 'UTM') {
				const toUTM = this.projectionConverterService.convertByProjectionDatum([+long, +lat], wgs84, utm);
				this.long = `${ Math.floor(toUTM[0]) }`;
				this.lat = `${ Math.floor(toUTM[1]) }`;
				this.zone = toUTM[2];
				this.height = height;
			} else {
				this.lat = lat;
				this.long = long;
				this.height = height;
				this.zone = null;
			}
		});
	}

	unregisterMouseEvents() {
		if (this.mouseMovedEventSubscriber) {
			this.mouseMovedEventSubscriber.unsubscribe();
			this.mouseMovedEventSubscriber = null;
		}
	}

	initCoordinates() {
		this.lat = null;
		this.long = null;
		this.height = null;
	}

	ngOnInit() {
		this.communicators.instanceCreated.pipe(
			filter(({ id }) => id === this.mapId),
			tap(() => {
				this.communicator = this.communicators.provide(this.mapId);
				this.registerMouseEvents();
				this.communicator.mapInstanceChanged.subscribe((args: IMapInstanceChanged) => {
					this.unregisterMouseEvents();
					this.initCoordinates();
					this.registerMouseEvents();
				})

			}),
			take(1)
		).subscribe();
	}

	ngOnDestroy(): void {
		this.unregisterMouseEvents();
	}
}
