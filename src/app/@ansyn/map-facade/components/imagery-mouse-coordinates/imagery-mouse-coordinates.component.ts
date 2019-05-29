import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { filter, take, tap } from 'rxjs/operators';
import { CommunicatorEntity, ImageryCommunicatorService, IMapInstanceChanged, IMousePointerMove } from '@ansyn/imagery';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { IMapFacadeConfig } from '../../models/map-config.model';

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

	lat: string;
	long: string;
	height: string;

	constructor(protected communicators: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig) {
		this.floatingPositionSuffix = this.config.floatingPositionSuffix || '';
	}

	registerMouseEvents() {
		this.mouseMovedEventSubscriber = this.communicator.ActiveMap.mousePointerMoved.subscribe( (args: IMousePointerMove) => {
			this.lat = !isNaN(args.lat) ? args.lat.toFixed(5) : null;
			this.long = !isNaN(args.long) ? args.long.toFixed(5) : null;
			this.height = !isNaN(args.height) ? args.height.toFixed(2) : null;
		});
	}

	unregisterMouseEvents() {
		if (this.mouseMovedEventSubscriber) {
			this.mouseMovedEventSubscriber.unsubscribe();
			this.mouseMovedEventSubscriber = null;
		}
	}

	ngOnInit() {
		this.communicators.instanceCreated.pipe(
			filter(({ id }) => id === this.mapId),
			tap(() => {
				this.communicator = this.communicators.provide(this.mapId);
				this.registerMouseEvents();
				this.communicator.mapInstanceChanged.subscribe((args: IMapInstanceChanged) => {
					this.unregisterMouseEvents();
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
