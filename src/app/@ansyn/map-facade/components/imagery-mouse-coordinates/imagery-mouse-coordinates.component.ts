import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { filter, take, tap } from 'rxjs/operators';
import { CommunicatorEntity, ImageryCommunicatorService, IMapInstanceChanged, IMousePointerMove } from '@ansyn/imagery';

@Component({
	selector: 'ansyn-imagery-mouse-coordinates',
	templateUrl: './imagery-mouse-coordinates.component.html',
	styleUrls: ['./imagery-mouse-coordinates.component.less']
})
export class ImageryMouseCoordinatesComponent implements OnInit, OnDestroy {

	@Input() mapId;
	mouseMovedEventSubscriber;
	communicator: CommunicatorEntity;

	lat: number;
	long: number;
	height: number;

	constructor(protected communicators: ImageryCommunicatorService) {
	}

	registerMouseEvents() {
		const communicator = this.communicators.provide(this.mapId);
		this.mouseMovedEventSubscriber = communicator.ActiveMap.mousePointerMoved.subscribe( (args: IMousePointerMove) => {
			this.lat = args.lat;
			this.long = args.long;
			this.height = args.height;
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
