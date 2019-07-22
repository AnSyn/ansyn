import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { getPointByGeometry, toDegrees, toRadians } from '@ansyn/imagery';
import { ContextMenuShowAngleFilter, IEntryComponent, MapActionTypes } from '@ansyn/map-facade';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Point } from 'geojson';
import { debounceTime, tap } from 'rxjs/operators';
import { DisplayOverlayAction, SetHoveredOverlayAction, SetMarkUp } from '../../../overlays/actions/overlays.actions';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { MarkUpClass } from '../../../overlays/reducers/overlays.reducer';

export interface IAngle {
	overlay: IOverlay;
	degreeFromPoint: number;
	distanceFromPoint: number;
}
const WORLD_RADIUS = 6371e3;
@Component({
	selector: 'ansyn-angle-filter',
	templateUrl: './angle-filter.component.html',
	styleUrls: ['./angle-filter.component.less']
})
@AutoSubscriptions()
export class AngleFilterComponent implements OnInit, OnDestroy, IEntryComponent {

	mapId: string;
	overlay: IOverlay;
	overlaysAngles: IAngle[];
	point: Point;
	@AutoSubscription
	showAngleFilter$ = this.actions$.pipe(
		ofType(MapActionTypes.CONTEXT_MENU.ANGLE_FILTER_SHOW),
		debounceTime(200),
		tap(this.show.bind(this))
	);

	setAnglesToOverlays(overlays: IOverlay[]) {
		const pointLat = this.getLatFromPoint(this.point, true);
		const pointLong = this.getLongFromPoint(this.point, true);
		this.overlaysAngles = overlays.filter( overlay => overlay.sensorLocation).map((overlay) => {
			const center = overlay.sensorLocation;
			const centerLat = this.getLatFromPoint(center, true);
			const centerLong = this.getLongFromPoint(center, true);
			const longDelta = centerLong - pointLong;
			const latDelta = centerLat - pointLat;
			const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) + Math.cos(pointLat) * Math.cos(centerLat) * Math.sin(longDelta / 2 ) * Math.sin( longDelta / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			const d = WORLD_RADIUS * c;
			const y = Math.sin(longDelta) * Math.cos(centerLat);
			const x = Math.cos(pointLat) * Math.sin(centerLat) - Math.sin(pointLat) * Math.cos(centerLat) * Math.cos(longDelta);
			const brng = 360 - (toDegrees(Math.atan2(y, x)));
			return {
				overlay: overlay,
				degreeFromPoint: brng,
				distanceFromPoint: d / (10 ** Math.log2(d))
			}
		});
		this.overlaysAngles.sort((a, b) => a.degreeFromPoint - b.degreeFromPoint)
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
		this.setAnglesToOverlays(action.payload.overlays);
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
		this.hide();
		this.overlay = overlay;
		this.store$.dispatch(new DisplayOverlayAction({ overlay: overlay, mapId: this.mapId }));
	}


	nextOverlay(isNext: boolean) {
		const anglesSize = this.overlaysAngles.length;
		let index = this.overlaysAngles.findIndex((angle) => this.overlay.id === angle.overlay.id);
		index += isNext ? 1 : -1;
		if (index === anglesSize) {
			index = 0;
		} else if (index === -1) {
			index = anglesSize - 1;
		}
		const overlayToDisplay = this.overlaysAngles[index].overlay;
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

	overlayOver(overlay?: any) {
		this.store$.dispatch(new SetMarkUp({
			classToSet: MarkUpClass.hover, dataToSet: {
				overlaysIds: overlay ? [overlay.id] : []
			}
		}));
		this.store$.dispatch(new SetHoveredOverlayAction(overlay));
	}
}
