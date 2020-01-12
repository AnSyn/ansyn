import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import {
	ImageryCommunicatorService,
	toDegrees,
	toRadians
} from '@ansyn/imagery';
import {
	ContextMenuShowAngleFilter,
	IEntryComponent,
	MapActionTypes,
	selectActiveMapId
} from '@ansyn/map-facade';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Point } from 'geojson';
import { debounceTime, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import {
	DisplayOverlayFromStoreAction,
	SetHoveredOverlayAction,
	SetMarkUp
} from '../../../overlays/actions/overlays.actions';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { MarkUpClass, selectDropMarkup } from '../../../overlays/reducers/overlays.reducer';
import { getAngleDegreeBetweenPoints, getDistanceBetweenPoints } from '@ansyn/imagery';

export interface IAngle {
	overlay: IOverlay;
	degreeFromPoint: number;
	distanceFromPoint: number;
}

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
	hoverOverlay: string;
	point: Point;
	mapRotation = 0;
	_show: boolean;

	@AutoSubscription
	showAngleFilter$ = this.actions$.pipe(
		ofType(MapActionTypes.CONTEXT_MENU.ANGLE_FILTER_SHOW),
		debounceTime(200),
		withLatestFrom(this.store$.select(selectActiveMapId), (action: ContextMenuShowAngleFilter, mapId: string): [ContextMenuShowAngleFilter] => {
			const communicator = this.communicatorService.provide(mapId);
			if (Boolean(communicator)) {
				this.mapRotation  = toDegrees(communicator.getRotation() - communicator.getVirtualNorth());
			}
			return [action];
		}),
		tap(this.show.bind(this))
	);

	@AutoSubscription
	onHoverFootprintOrTimeline = this.store$.select(selectDropMarkup).pipe(
		filter(drops => Boolean(drops)),
		map((drops) => drops.get(MarkUpClass.hover)),
		filter(hovers => Boolean(this.overlaysAngles && this.overlaysAngles.length)),
		tap(hovers => this.hoverOverlay = hovers.overlaysIds[0])
	);

	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected elem: ElementRef,
				protected renderer: Renderer2,
				protected communicatorService: ImageryCommunicatorService) {
	}

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 1;
	}

	@HostListener('window:mousewheel')
	get onMousewheel() {
		return this.hide;
	}

	setAnglesToOverlays(overlays: IOverlay[]) {
		this.overlaysAngles = overlays.map((overlay) => {
			const brng = getAngleDegreeBetweenPoints(overlay.sensorLocation, this.point);
			const distance = getDistanceBetweenPoints(overlay.sensorLocation, this.point);
			const data: IAngle = {
				degreeFromPoint: brng + this.mapRotation,
				overlay: overlay,
				distanceFromPoint: distance
			};
			return data;
		});
		this.overlaysAngles.sort((a, b) => a.degreeFromPoint - b.degreeFromPoint)
	}

	@HostListener('contextmenu', ['$event'])
	onContextMenu($event) {
		$event.preventDefault();
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	show([action]: [ContextMenuShowAngleFilter, number]) {
		this.point = action.payload.point;
		this.overlay = action.payload.displayedOverlay;
		this.setAnglesToOverlays(action.payload.overlays);
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${ action.payload.click.y }px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${ action.payload.click.x }px`);
		this.elem.nativeElement.focus();
		this._show = true;
	}

	hide() {
		this._show = false;
		this.overlayHover();
		this.elem.nativeElement.blur();

	}

	getType(): string {
		return '';
	}

	showOverlay(event: MouseEvent, angleData: any) {
		event.stopPropagation();
		this.overlay = angleData.overlay;
		this.store$.dispatch(DisplayOverlayFromStoreAction({
			id: angleData.overlay.id,
			customOriantation: 'Imagery Perspective'
		}));
		this.hide();
	}

	nextOverlay(event: MouseEvent, isNext: boolean) {
		event.stopPropagation();
		const anglesSize = this.overlaysAngles.length;
		let index = this.overlaysAngles.findIndex((angle) => this.overlay.id === angle.overlay.id);
		index += isNext ? 1 : -1;
		if (index === anglesSize) {
			index = 0;
		} else if (index === -1) {
			index = anglesSize - 1;
		}
		const overlayToDisplay = this.overlaysAngles[index].overlay;
		this.store$.dispatch(DisplayOverlayFromStoreAction({ id: overlayToDisplay.id }));
	}

	isActive(overlay: any) {
		return this.overlay && this.overlay.id === overlay.id;
	}

	overlayHover(overlay?: any) {
		this.store$.dispatch(SetMarkUp({
			classToSet: MarkUpClass.hover, dataToSet: {
				overlaysIds: overlay ? [overlay.id] : []
			}
		}));
		this.store$.dispatch(SetHoveredOverlayAction(overlay));
	}
}
