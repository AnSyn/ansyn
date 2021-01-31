import { Component, ElementRef, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { fromEvent, Observable } from 'rxjs';
import { getTimeFormat } from '@ansyn/map-facade';
import {
	IOverlaysState,
	MarkUpClass,
	selectCustomOverviewElementId,
	selectHoveredOverlay
} from '../../reducers/overlays.reducer';
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
import { TranslateService } from '@ngx-translate/core';

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
	myCurrentWidth: number;

	get dropElement(): Element {
		return this.el.nativeElement.ownerDocument.getElementById(`dropId-${ this.overlayId }`);
	}

	public get overViewConstants() {
		return overlayOverviewComponentConstants;
	}

	public get errorSrc() {
		return this.overViewConstants.OVERLAY_OVERVIEW_FAILED;
	};

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

	constructor(
		public store$: Store<IOverlaysState>,
		public actions$: Actions,
		protected el: ElementRef,
		protected translateService: TranslateService
	) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	onHoveredOverlay([overlay, customElementId]: [IOverviewOverlay, string]): void {
		overlay ? this.showOverview(overlay, customElementId) : this.hideOverview();
	}

	setOverviewPosition(customElementId: string): void {
		const customElement = customElementId && this.el.nativeElement.ownerDocument.getElementById(customElementId);
		const hoveredElement: Element = customElement || this.dropElement;
		if (!hoveredElement) {
			return;
		}
		this.myCurrentWidth = (this.el.nativeElement as HTMLElement).offsetWidth;
		const { left, height, top }: ClientRect = hoveredElement.getBoundingClientRect();
		this.left = customElement ? left - this.myCurrentWidth : this.getLeftPosition(left);
		this.top = top + (customElement ? height + 70 : 0);
	}

	getLeftPosition(hoveredElementPos: number): number {
		const candidateLeftPos = hoveredElementPos - 50;
		const ansynWidth = this.topElement.getBoundingClientRect().width;
		// ^ Ansyn component is not a block element, therefore it doesn't have offsetWidth
		// Therefore I used getBoundingClientRect()
		return Math.min(candidateLeftPos, ansynWidth - this.myCurrentWidth);
	}

	showOverlayImage(thumbnailUrl: string): void {
		const fetching = thumbnailUrl === this.overViewConstants.FETCHING_OVERLAY_DATA;
		if (fetching) {
			this.img.nativeElement.removeAttribute('src');
		} else {
			this.img.nativeElement.src = thumbnailUrl;
		}

	}

	showOverlayData(id: string, sensorName: string, sensorType: string): void {
		this.overlayId = id;
		this.sensorName = sensorName;
		this.sensorType = sensorType;
	}

	showOverview(overlay: IOverlay, customElementId: string): void {
		this.setOverviewPosition(customElementId);

		this.isHoveringOverDrop = true;
		this.mouseLeave$.subscribe();
		this.showOverlayData(overlay.id, overlay.sensorName, overlay.sensorType);
		this.showOverlayImage(overlay.thumbnailUrl);

		this.formattedTime = getTimeFormat(new Date(overlay.photoTime));
		if (!this.img.nativeElement.complete) {
			this.startedLoadingImage();
		}
	}

	hideOverview(): void {
		this.isHoveringOverDrop = false;
	}

	onDblClick(): void {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id: this.overlayId }));
	}

	startedLoadingImage(): void {
		this.loadingImage = true;
	}

	finishedLoadingImage(): void {
		this.loadingImage = false;
	}
}
