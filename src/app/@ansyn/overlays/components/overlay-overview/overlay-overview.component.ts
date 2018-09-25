import { Component, ElementRef, HostBinding, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
import { tap } from 'rxjs/operators';
import { OverlaysConfig } from '../../services/overlays.service';
import { IOverlaysConfig } from '../../models/overlays.config';
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

	public sensorName: string;
	public formattedTime: string;
	public overlayId: string;

	private _fetchingImageUrl = false;
	private _loadingImage = false;
	public get fetchingUrlOrLoadingImage() {
		return this._fetchingImageUrl || this._loadingImage;
	}

	public errorSrc = this.overlaysConfig.overlayOverviewFailed;

	public rotation = 0;
	protected topElement = this.el.nativeElement.parentElement;

	public get const() {
		return overlayOverviewComponentConstants;
	}

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


	// Mark the original overlay as un-hovered when mouse leaves
	@HostListener('mouseleave')
	onMouseOut() {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	constructor(
		public store$: Store<IOverlaysState>,
		public actions$: Actions,
		protected el: ElementRef,
		protected translate: TranslateService,
		@Inject(OverlaysConfig) protected overlaysConfig: IOverlaysConfig) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	onHoveredOverlay(overlay: IOverlay) {
		if (overlay) {
			this.checkIfFetchingImageUrl(overlay);
			const isNewOverlay = this.overlayId !== overlay.id;
			this.overlayId = overlay.id;
			const hoveredElement: Element = this.topElement.querySelector(`#dropId-${this.overlayId}`);
			if (hoveredElement) {
				const hoveredElementBounds: ClientRect = hoveredElement.getBoundingClientRect();
				this.left = hoveredElementBounds.left - 50;
				this.top = hoveredElementBounds.top;
				this.isHoveringOverDrop = true;

				this.sensorName = overlay.sensorName;
				this.img.nativeElement.src = this._fetchingImageUrl ? '' : overlay.thumbnailUrl;
				this.formattedTime = getTimeFormat(new Date(overlay.photoTime));
				if (isNewOverlay && !this.img.nativeElement.complete) {
					this.startedLoadingImage();
				}
			}
		} else {
			this.isHoveringOverDrop = false;
		}
	}

	onDblClick() {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id: this.overlayId }));
	}

	startedLoadingImage() {
		this._loadingImage = true;
	}

	finishedLoadingImage() {
		this._loadingImage = false;
	}

	checkIfFetchingImageUrl(overlay: IOverlay): void {
		const fetching = overlay.thumbnailUrl === this.const.FETCHING_OVERLAY_DATA;
		if (!fetching && this._fetchingImageUrl) {
			this.startedLoadingImage();
		}
		this._fetchingImageUrl = fetching;
	}
}
