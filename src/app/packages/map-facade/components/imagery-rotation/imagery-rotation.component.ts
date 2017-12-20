import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { PositionChangedAction, SetMapRotationAction } from '../../actions/map.actions';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapEffects } from '../../effects/map.effects';
import { getCorrectedNorthOnce, INorthData, setCorrectedNorth } from '@ansyn/core/utils/north';
import { get } from 'lodash';

@Component({
	selector: 'ansyn-imagery-rotation',
	templateUrl: './imagery-rotation.component.html',
	styleUrls: ['./imagery-rotation.component.less']
})
export class ImageryRotationComponent implements AfterViewInit {
	@Input() mapState: CaseMapState;

	isRotating = false;
	// false - means show image photo angle
	showNorth = true;

	northDirection: number;

	constructor(protected elementRef: ElementRef,
				protected store: Store<any>,
				protected mapEffects$: MapEffects,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		this.northDirection = 0;
	}

	ngAfterViewInit(): void {
		this.mapEffects$.positionChanged$.subscribe(this.onPositionChanged.bind(this));
	}

	onPositionChanged(action: PositionChangedAction) {
		if (!this.mapState.data.overlay) {
			this.northDirection = this.mapState.data.position.rotation;
		} else {
			const communicatorEntity = this.imageryCommunicatorService.provide(this.mapState.id);
			getCorrectedNorthOnce(communicatorEntity.ActiveMap.mapObject).then((data: INorthData) => {
				this.northDirection = -data.northOffsetRad;
			});
		}
	}

	stopPropagation($event: Event) {
		$event.stopPropagation();
		$event.preventDefault(); // prevents the dragging of the image.
	}

	protected setRotation(radians: number) {
		this.store.dispatch(new SetMapRotationAction({ mapId: this.mapState.id, radians }));
	}

	// toggle north / image azimuth - begin
	toggleNorth() {
		if (!this.mapState.data.overlay) {
			this.showNorth = true;
			this.pointNorth();
		} else {
			this.showNorth = !this.showNorth;
			this.pointImagePhotoAngle();
		}
	}

	pointImagePhotoAngle() {
		if (this.mapState.data.overlay) {
			this.setRotation(this.mapState.data.overlay.azimuth);
		}
	}

	pointNorth() {
		if (!this.mapState.data.overlay) {
			this.setRotation(0);
		} else {
			const communicatorEntity = this.imageryCommunicatorService.provide(this.mapState.id);
			setCorrectedNorth(communicatorEntity.ActiveMap.mapObject);
		}
	}
	// toggle north / image azimuth - end

	getImageNorth(): Promise<number> {
		if (!this.mapState.data.overlay) {
			return Promise.resolve(this.mapState.data.position.rotation);
		}

		const communicatorEntity = this.imageryCommunicatorService.provide(this.mapState.id);
		return getCorrectedNorthOnce(communicatorEntity.ActiveMap.mapObject).then((northData: INorthData) => {
			return Promise.resolve(-northData.northOffsetRad);
		});
	}

	startRotating($event) {
		$event.preventDefault();

		this.isRotating = true;

		const element = this.elementRef.nativeElement;

		const boundingRect = element.getBoundingClientRect();

		const center = {
			x: boundingRect.left + boundingRect.width / 2,
			y: boundingRect.top + boundingRect.height / 2
		};

		const mouseMoveListener = (event) => {
			const mouse = {
				x: event.pageX,
				y: event.pageY
			};

			let radians = Math.atan2(mouse.y - center.y, mouse.x - center.x) + Math.PI / 2;
			this.setRotation(radians);
		};

		document.addEventListener<'mousemove'>('mousemove', mouseMoveListener);

		const mouseUpListener = () => {
			document.removeEventListener('mousemove', mouseMoveListener);
			document.removeEventListener('mouseup', mouseUpListener);
			this.isRotating = false;
		};

		document.addEventListener<'mouseup'>('mouseup', mouseUpListener);
	}
}
