import { Component, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetMapRotationAction } from '../../actions/map.actions';
import { get } from 'lodash';
import { CaseMapState } from '@ansyn/core/models/case.model';

@Component({
	selector: 'ansyn-imagery-rotation',
	templateUrl: './imagery-rotation.component.html',
	styleUrls: ['./imagery-rotation.component.less']
})
export class ImageryRotationComponent {
	@Input() mapState: CaseMapState;

	isRotating = false;

	get northAngle() {
		return get(this.mapState, 'data.overlay.northAngle', 0);
	}

	get rotationAngle() {
		return get(this.mapState, 'data.position.projectedState.rotation', 0) - this.northAngle;
	}

	constructor(protected elementRef: ElementRef,
				protected store: Store<any>) {
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
			this.setRotation(this.northAngle);
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
			this.setRotation(radians + this.northAngle);
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
