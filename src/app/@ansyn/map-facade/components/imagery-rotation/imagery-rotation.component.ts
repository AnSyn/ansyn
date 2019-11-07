import { Component, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommunicatorEntity, ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { PointToRealNorthAction } from '../../actions/map.actions';

export interface IsGeoRegisteredProperties {
	letter: 'N' | '?';
	color: '#6e6e7f' | 'red';
	tooltipNorth: 'Drag to Change Orientation' | 'Press Alt+Shift and drag to rotate';
	tooltip: 'Click once to face north, twice for image perspective' | null;
	compass: 'assets/icons/map/compass.svg' | 'assets/icons/map/compass_disabled.svg';
	rotatePointer: 'rotationAngle' | 'notGeoRegisteredNorthAngle';
}

@Component({
	selector: 'ansyn-imagery-rotation',
	templateUrl: './imagery-rotation.component.html',
	styleUrls: ['./imagery-rotation.component.less']
})
export class ImageryRotationComponent {
	@Input() mapState: IMapSettings;

	protected thresholdDegrees = 0.1;

	isGeoRegisteredProperties: IsGeoRegisteredProperties = {
		letter: 'N',
		color: 'red',
		tooltipNorth: 'Drag to Change Orientation',
		tooltip: 'Click once to face north, twice for image perspective',
		compass: 'assets/icons/map/compass.svg',
		rotatePointer: 'rotationAngle'
	};

	notGeoRegisteredProperties: IsGeoRegisteredProperties = {
		letter: '?',
		color: '#6e6e7f',
		tooltipNorth: 'Drag to Change Orientation',
		tooltip: null,
		compass: 'assets/icons/map/compass_disabled.svg',
		rotatePointer: 'notGeoRegisteredNorthAngle'
	};

	isRotating = false;

	get geoRegisteredProperties(): IsGeoRegisteredProperties {
		return this.isGeoRegistered() ? this.isGeoRegisteredProperties : this.notGeoRegisteredProperties;
	}

	get communicator(): CommunicatorEntity {
		return this.imageryCommunicatorService.provide(this.mapState.id);
	}

	get virtualNorth() {
		return this.communicator ? this.communicator.getVirtualNorth() : 0;
	}

	get notGeoRegisteredNorthAngle() {
		return ((this.communicator && this.communicator.getRotation()) || 0);
	}

	get rotationAngle() {
		return ((this.communicator && this.communicator.getRotation()) || 0) - this.virtualNorth;
	}

	constructor(protected elementRef: ElementRef,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected store: Store<any>) {
	}

	toDegrees(radians: number): number {
		return radians * 180 / Math.PI;
	}

	isGeoRegistered() {
		// todo: overlay is not known in map facade
		return !this.mapState.data.overlay || (this.mapState.data.overlay.isGeoRegistered !== 'notGeoRegistered');
	}

	// stopPropagation($event: Event) {
	// 	$event.stopPropagation();
	// 	$event.preventDefault(); // prevents the dragging of the image.
	// }

	protected setRotation(radians: number) {
		this.communicator.setRotation(radians);
	}

	toggleNorth() {
		if (Math.abs(this.toDegrees(this.rotationAngle)) < this.thresholdDegrees) {
			const overlay = this.mapState.data.overlay;
			if (overlay) {
				this.setRotation(overlay.azimuth);
			}
		} else {
			this.store.dispatch(new PointToRealNorthAction(this.mapState.id));
		}
	}

	startRotating($event) {
		// $event.preventDefault();

		this.isRotating = true;

		const element = this.elementRef.nativeElement;

		const boundingRect = element.getBoundingClientRect();

		const center = {
			x: boundingRect.left + boundingRect.width / 2,
			y: boundingRect.top + boundingRect.height / 2
		};

		const mouseMoveListener = (event) => {
			const mouse = {
				x: event.clientX,
				y: event.clientY
			};

			let radians = Math.atan2(mouse.y - center.y, mouse.x - center.x) + Math.PI / 2;
			this.setRotation(radians + this.virtualNorth);
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
