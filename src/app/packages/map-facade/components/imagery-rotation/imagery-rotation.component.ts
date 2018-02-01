import { Component, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetMapRotationAction } from '../../actions/map.actions';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { get } from 'lodash';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';

export interface IsGeoRegisteredProperties {
	letter: 'N' | '?';
	color: '#6e6e7f' | 'red';
	tooltipNorth: 'Drag to Change Orientation' | 'Press Ctrl+Shift+Alt and drag to rotate';
	tooltip: 'Click once to face north, twice for image perspective' | null;
	compass: '/assets/icons/map/compass.svg' | '/assets/icons/map/compass_disabled.svg';
	rotatePointer: 'rotationAngle' | 'notGeoRegitredNorthAngle';
}

@Component({
	selector: 'ansyn-imagery-rotation',
	templateUrl: './imagery-rotation.component.html',
	styleUrls: ['./imagery-rotation.component.less']
})
export class ImageryRotationComponent {
	@Input() mapState: CaseMapState;

	isGeoRegisteredProperties: IsGeoRegisteredProperties = {
		letter: 'N',
		color: 'red',
		tooltipNorth: 'Drag to Change Orientation',
		tooltip: 'Click once to face north, twice for image perspective',
		compass: '/assets/icons/map/compass.svg',
		rotatePointer: 'rotationAngle'
	};

	notGeoRegisteredProperties: IsGeoRegisteredProperties = {
		letter: '?',
		color: '#6e6e7f',
		tooltipNorth: 'Press Ctrl+Shift+Alt and drag to rotate',
		tooltip: null,
		compass: '/assets/icons/map/compass_disabled.svg',
		rotatePointer: 'notGeoRegitredNorthAngle'
	};

	isRotating = false;

	get geoRegiteredProperties(): IsGeoRegisteredProperties {
		return this.isGeoRegistered() ? this.isGeoRegisteredProperties : this.notGeoRegisteredProperties;
	}

	get communicator(): CommunicatorEntity {
		return this.imageryCommunicatorService.provide(this.mapState.id)
	}

	get virtualNorth() {
		return this.communicator.getVirtualNorth();
	}

	get notGeoRegitredNorthAngle() {
		return 0;
	}

	get rotationAngle() {
		return get(this.mapState, 'data.position.projectedState.rotation', 0) - this.virtualNorth;
	}

	constructor(protected elementRef: ElementRef,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected store: Store<any>) {
	}

	isGeoRegistered() {
		return !this.mapState.data.overlay || this.mapState.data.overlay.isGeoRegistered;
	}

	stopPropagation($event: Event) {
		$event.stopPropagation();
		$event.preventDefault(); // prevents the dragging of the image.
	}

	protected setRotation(radians: number) {
		this.store.dispatch(new SetMapRotationAction({ mapId: this.mapState.id, radians }));
	}

	toggleNorth() {
		if (this.rotationAngle === 0) {
			const overlay = this.mapState.data.overlay;
			if (overlay) {
				this.setRotation(overlay.azimuth);
			}
		} else {
			this.setRotation(this.virtualNorth);
		}
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
