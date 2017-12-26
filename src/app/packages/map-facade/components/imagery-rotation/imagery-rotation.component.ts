import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { CaseMapState } from '@ansyn/core';
import { PointNorthAction, SetMapRotationAction, UpdateNorthAngleAction } from '../../actions/map.actions';
import { MapEffects } from '../../effects/map.effects';
import { get } from 'lodash';

@Component({
	selector: 'ansyn-imagery-rotation',
	templateUrl: './imagery-rotation.component.html',
	styleUrls: ['./imagery-rotation.component.less']
})
export class ImageryRotationComponent implements AfterViewInit {
	_mapState: CaseMapState;

	public get mapState(): CaseMapState {
		return this._mapState;
	}

	@Input()
	public set mapState(mapState: CaseMapState) {
		this._mapState = mapState;
		this.rotationAngle = get(this._mapState, "data.position.projectedState.rotation", 0);
	}

	isRotating = false;
	// false - means show image photo angle
	showNorth = true;

	rotationAngle: number;

	constructor(protected elementRef: ElementRef,
				protected store: Store<any>,
				protected mapEffects$: MapEffects) {
		this.rotationAngle = 0;
	}

	ngAfterViewInit(): void {
		this.mapEffects$.onNorthAngleChanged$.subscribe((updateNorthAngle: UpdateNorthAngleAction) => {
			if (updateNorthAngle.payload.mapId === this.mapState.id) {
				this.rotationAngle = updateNorthAngle.payload.angleRad;
			}
		});
	}

	stopPropagation($event: Event) {
		$event.stopPropagation();
		$event.preventDefault(); // prevents the dragging of the image.
	}

	protected setRotation(radians: number) {
		this.store.dispatch(new SetMapRotationAction({ mapId: this.mapState.id, radians }));
	}

	toggleNorth() {
		if (!this.mapState.data.overlay) {
			this.showNorth = true;
		} else {
			this.showNorth = !this.showNorth;
		}

		if (this.showNorth) {
			this.store.dispatch(new PointNorthAction({mapId: this.mapState.id, rotationType: 'North', overlay: this.mapState.data.overlay}));
		} else {
			this.store.dispatch(new PointNorthAction({mapId: this.mapState.id, rotationType: 'ImageAngle', overlay: this.mapState.data.overlay}));
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
