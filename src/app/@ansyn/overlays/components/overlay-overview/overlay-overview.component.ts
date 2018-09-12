import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IOverlay } from '@ansyn/core';
import { getTimeFormat } from '@ansyn/core';
import { TranslateService } from '@ngx-translate/core';
import { IOverlaysState, MarkUpClass, selectHoveredOverlay } from '../../reducers/overlays.reducer';
import { overlayOverviewComponentConstants } from './overlay-overview.component.const';
import { DisplayOverlayFromStoreAction, SetMarkUp } from '../../actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { OverlaysConfig } from '../../services/overlays.service';
import { IOverlaysConfig } from '../../models/overlays.config';
import { Inject } from '@angular/core';

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

	public loading = false;
	public errorSrc = this.overlaysConfig.overlayOverviewFailed;

	protected topElement = this.el.nativeElement.parentElement;

	public get const() {
		return overlayOverviewComponentConstants;
	}

	@HostBinding('class.show') isHoveringOverDrop = false;
	@HostBinding('style.left.px') left = 0;
	@HostBinding('style.top.px') top = 0;

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
		protected el: ElementRef,
		protected translate: TranslateService,
		@Inject(OverlaysConfig) protected overlaysConfig: IOverlaysConfig
	) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	onHoveredOverlay(overlay: IOverlay) {
		if (overlay) {
			const isNewOverlay = this.overlayId !== overlay.id;
			const isFetchingOverlayData = overlay.thumbnailUrl === this.const.FETCHING_OVERLAY_DATA;
			this.overlayId = overlay.id;
			const hoveredElement: Element = this.topElement.querySelector(`#dropId-${this.overlayId}`);
			if (hoveredElement) {
				const hoveredElementBounds: ClientRect = hoveredElement.getBoundingClientRect();
				this.left = hoveredElementBounds.left - 50;
				this.top = hoveredElementBounds.top;
				this.isHoveringOverDrop = true;

				this.sensorName = overlay.sensorName;
				this.img.nativeElement.src = isFetchingOverlayData ? undefined : overlay.thumbnailUrl;
				this.formattedTime = getTimeFormat(new Date(overlay.photoTime));
				if ((isNewOverlay || isFetchingOverlayData) && !this.img.nativeElement.complete) {
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
		this.loading = true;
	}

	finishedLoadingImage() {
		this.loading = false;
	}
}
