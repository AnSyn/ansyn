import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, HostBinding } from '@angular/core';
import { getPointByGeometry, toDegrees, toRadians } from '@ansyn/imagery';
import { IEntryComponent, MapActionTypes } from '@ansyn/map-facade';
import { Actions, ofType } from '@ngrx/effects';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap, debounceTime } from 'rxjs/operators';
import { ContextMenuShowAngleFilter } from '@ansyn/map-facade';
import { DisplayOverlayAction } from '../../../overlays/actions/overlays.actions';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { Point } from 'geojson';
import { GoAdjacentOverlay } from '../../../status-bar/actions/status-bar.actions';
import { Store } from '@ngrx/store';
import { fromEvent } from 'rxjs';

@Component({
	selector: 'ansyn-angle-filter',
	templateUrl: './angle-filter.component.html',
	styleUrls: ['./angle-filter.component.less']
})
@AutoSubscriptions()
export class AngleFilterComponent implements OnInit, OnDestroy, IEntryComponent {

	mapId: string;
	overlay: IOverlay;
	_angles: any[];
	point: Point;
	@AutoSubscription
	showAngleFilter$ = this.actions$.pipe(
		ofType(MapActionTypes.CONTEXT_MENU.ANGLE_FILTER_SHOW),
		debounceTime(200),
		tap(this.show.bind(this))
	);

	@AutoSubscription
	onBlur$ = fromEvent(this.elem.nativeElement, 'blur').pipe(
		tap(( ) => console.log('blur')));


	get angles() {
		return this._angles;
	}

	set angles(value: any[]) {
		console.log('point', JSON.stringify(this.point));
		this._angles = value.map((a) => {
			const center = getPointByGeometry(a.footprint);
			const y = Math.sin(this.getLongFromPoint(this.point, true) - this.getLongFromPoint(center, true)) * Math.cos(this.getLatFromPoint(center, true));
			const x = Math.cos(this.getLatFromPoint(this.point, true)) * Math.sin(this.getLatFromPoint(center, true)) -
				Math.sin(this.getLatFromPoint(this.point, true)) * Math.cos(this.getLatFromPoint(center, true)) * Math.cos(this.getLongFromPoint(center, true) - this.getLongFromPoint(this.point, true));
			const brng = (toDegrees(Math.atan2(y, x)) + 180);
			console.log(a.id + ', center: ' + JSON.stringify(center) + 'degree: ' + brng);

			return {
				overlay: a,
				degreeFromPoint: brng
			}
		});
		this._angles.sort( (a, b) => 	a.degreeFromPoint - b.degreeFromPoint)
	}

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 1;
	}

	@HostListener('window:mousewheel')
	get onMousewheel() {
		return this.hide;
	}

	@HostListener('contextmenu', ['$event'])
	onContextMenu($event) {
		$event.preventDefault();
	}


	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected elem: ElementRef,
				protected renderer: Renderer2) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	show(action: ContextMenuShowAngleFilter) {
		this.point = action.payload.point;
		this.overlay = action.payload.displayedOverlay;
		this.angles = action.payload.angles;
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${action.payload.click.y}px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${action.payload.click.x}px`);
		this.elem.nativeElement.focus();
	}

	hide() {
		this.renderer.setStyle(this.elem.nativeElement, 'top', `-1px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `-1px`);
		this.elem.nativeElement.blur();

	}



	getType(): string {
		return '';
	}

	showOverlay(event: MouseEvent, overlay: any) {
		event.stopPropagation();
		this.store$.dispatch(new DisplayOverlayAction({overlay: overlay, mapId: this.mapId}));
	}


	nextOverlay(isNext: boolean) {
		const anglesSize = this._angles.length;
		let index = this._angles.findIndex((angle) => this.overlay.id === angle.overlay.id);
		index += isNext ? 1 : -1;
		if (index === anglesSize) {
			index = 0;
		}
		else if (index === -1 ) {
			index = anglesSize - 1;
		}
		const overlayToDisplay = this._angles[index].overlay;
		this.store$.dispatch(new DisplayOverlayAction({ overlay: overlayToDisplay, mapId: this.mapId }));
	}

	private getLatFromPoint(point: Point, convert?: boolean) {
		if (convert) {
			toRadians(point.coordinates[1]);
		}
		return point.coordinates[1];
	}


	private getLongFromPoint(point: Point, convert?: boolean) {
		if (convert) {
			toRadians(point.coordinates[0]);
		}
		return point.coordinates[0];
	}

	isActive(overlay: any) {
		return this.overlay && this.overlay.id === overlay.id;
	}
}
