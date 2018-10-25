import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { fromEvent, Observable } from 'rxjs';
import { getTimeFormat, IOverlay } from '@ansyn/core';
import { TranslateService } from '@ngx-translate/core';
import { IOverlaysState, MarkUpClass, selectHoveredOverlay } from '../../reducers/overlays.reducer';
import { overlayOverviewComponentConstants } from './overlay-overview.component.const';
import {
	ChangeOverlayPreviewRotationAction,
	DisplayOverlayFromStoreAction,
	OverlaysActionTypes,
	SetMarkUp
} from '../../actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { takeWhile, tap } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

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

	mouseMove$ = fromEvent(window, 'mousemove').pipe(
		tap(($event: any) => {
			const excludeElements = [this.el.nativeElement, this.hoveredElement];
			if (!$event.path.some((elem) => excludeElements.includes(elem))) {
				this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
			}
		}),
		takeWhile(() => this.isHoveringOverDrop)
	);

	public mouseMoveSubscriber;
	public sensorName: string;
	public formattedTime: string;
	public overlayId: string;
	public loadingImage = false;
	public rotation = 0;
	protected topElement = this.el.nativeElement.parentElement;

	get hoveredElement(): Element {
		return this.topElement.querySelector(`#dropId-${this.overlayId}`);
	}

	public get const() {
		return overlayOverviewComponentConstants;
	}

	public get errorSrc() {
		return this.const.OVERLAY_OVERVIEW_FAILED;
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
		tap(this.onHoveredOverlay.bind(this))
	);

	constructor(
		public store$: Store<IOverlaysState>,
		public actions$: Actions,
		protected el: ElementRef,
		protected translate: TranslateService) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	onHoveredOverlay(overlay: IOverlay) {
		if (overlay) {
			const fetching = overlay.thumbnailUrl === this.const.FETCHING_OVERLAY_DATA;
			this.overlayId = overlay.id;
			const hoveredElement: Element = this.hoveredElement;
			if (!hoveredElement) {
				return;
			}
			const hoveredElementBounds: ClientRect = hoveredElement.getBoundingClientRect();
			this.left = hoveredElementBounds.left - 50;
			this.top = hoveredElementBounds.top;
			this.showOverview();
			this.sensorName = overlay.sensorName;
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

	showOverview() {
		this.isHoveringOverDrop = true;
		this.mouseMoveSubscriber = this.mouseMove$.subscribe();
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
