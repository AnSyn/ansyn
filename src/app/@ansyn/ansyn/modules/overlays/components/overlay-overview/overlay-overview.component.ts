import { Component, ElementRef, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { fromEvent, Observable } from 'rxjs';
import { getTimeFormat } from '@ansyn/map-facade';
import { IOverlaysState, MarkUpClass, selectCustomOverviewElementId, selectHoveredOverlay } from '../../reducers/overlays.reducer';
import { overlayOverviewComponentConstants } from './overlay-overview.component.const';
import {
	ChangeOverlayPreviewRotationAction,
	DisplayOverlayFromStoreAction,
	OverlaysActionTypes,
	SetMarkUp
} from '../../actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { takeWhile, tap, withLatestFrom } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import { IOverlay } from '../../models/overlay.model';

export interface IOverviewOverlay extends IOverlay {
	thumbnailName: string;
}

@Component({
	selector: 'ansyn-overlay-overview',
	templateUrl: './overlay-overview.component.html',
	styleUrls: ['./overlay-overview.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class OverlayOverviewComponent implements OnInit, OnDestroy {
	@ViewChild('img') img: ElementRef;

	public mouseLeave$: Observable<any> = fromEvent(this.el.nativeElement, 'mouseleave')
		.pipe(
			takeWhile(() => this.isHoveringOverDrop),
			tap(() => {
				this.store$.dispatch(new SetMarkUp({
					classToSet: MarkUpClass.hover,
					dataToSet: { overlaysIds: [] }
				}));
			})
		);

	public sensorName: string;
	public sensorType: string;
	public formattedTime: string;
	public overlayId: string;
	public loadingImage = false;
	public rotation = 0;
	protected topElement = this.el.nativeElement.parentElement;

	@HostBinding('class.show') isHoveringOverDrop = false;
	@HostBinding('style.left.px') left = 0;
	@HostBinding('style.top.px') top = 0;

	@AutoSubscription
	rotationChanged$: Observable<any> = this.actions$.pipe(
		ofType<ChangeOverlayPreviewRotationAction>(OverlaysActionTypes.CHANGE_OVERLAY_PREVIEW_ROTATION),
		tap(({ payload }) => this.rotation = payload)
	);

	@AutoSubscription
	hoveredOverlay$: Observable<any> = this.store$.pipe(
		select(selectHoveredOverlay),
		withLatestFrom(this.store$.select(selectCustomOverviewElementId)),
		tap(this.onHoveredOverlay.bind(this))
	);

	get dropElement(): Element {
		return this.el.nativeElement.ownerDocument.getElementById(`dropId-${ this.overlayId }`);
	}

	public get const() {
		return overlayOverviewComponentConstants;
	}

	public get errorSrc() {
		return this.const.OVERLAY_OVERVIEW_FAILED;
	};

	constructor(
		public store$: Store<IOverlaysState>,
		public actions$: Actions,
		protected el: ElementRef) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	onHoveredOverlay([overlay, customElementId]: [IOverviewOverlay, string]) {
		if (overlay) {
			const fetching = overlay.thumbnailUrl === this.const.FETCHING_OVERLAY_DATA;
			this.overlayId = overlay.id;
			const customElement = customElementId && this.el.nativeElement.ownerDocument.getElementById(customElementId);
			const hoveredElement: Element = customElement || this.dropElement;
			if (!hoveredElement) {
				return;
			}
			const hoveredElementBounds: ClientRect = hoveredElement.getBoundingClientRect();
			this.left = customElement ? hoveredElementBounds.right : this.getLeftPosition(hoveredElementBounds.left);
			this.top = hoveredElementBounds.top + (customElement ? hoveredElementBounds.height : 0);
			this.showOverview();
			this.sensorName = overlay.sensorName;
			this.sensorType = overlay.sensorType;
			if (fetching) {
				this.img.nativeElement.removeAttribute('src');
			} else {
				this.img.nativeElement.src = overlay.thumbnailUrl;
			}
			this.formattedTime = getTimeFormat(new Date(overlay.photoTime));
			if (!this.img.nativeElement.complete) {
				this.startedLoadingImage();
			}
		} else {
			this.hideOverview();
		}
	}

	getLeftPosition(hoveredElementPos: number): number {
		const candidateLeftPos = hoveredElementPos - 50;
		const myCurrentWidth = (this.el.nativeElement as HTMLElement).offsetWidth;
		const ansynWidth = this.topElement.getBoundingClientRect().width;
		// ^ Ansyn component is not a block element, therefore it doesn't have offsetWidth
		// Therefore I used getBoundingClientRect()
		return Math.min(candidateLeftPos, ansynWidth - myCurrentWidth);
	}

	showOverview() {
		this.isHoveringOverDrop = true;
		this.mouseLeave$.subscribe();
	}

	hideOverview() {
		this.isHoveringOverDrop = false;
	}

	onDblClick() {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id: this.overlayId }));
	}

	startedLoadingImage() {
		this.loadingImage = true;
	}

	finishedLoadingImage() {
		this.loadingImage = false;
	}
}
