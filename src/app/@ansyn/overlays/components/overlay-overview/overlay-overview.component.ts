import { Component, HostBinding, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { HoveredOverlayDropData } from '@ansyn/overlays/models/hovered-overlay-data.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { getTimeFormat } from '@ansyn/core/utils/time';
import { DOCUMENT } from '@angular/common';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';

@Component({
	selector: 'ansyn-overlay-overview',
	templateUrl: './overlay-overview.component.html',
	styleUrls: ['./overlay-overview.component.less']
})
export class OverlayOverviewComponent implements OnInit, OnDestroy {
	private _subscriptions: Subscription[] = [];
	public overlay: any;
	public formattedTime: string;
	public overlayId: string;
	isHoveringOverDrop = false;
	isHoveringOverMe = false;

	@HostBinding('class.show')  get show() {
		return this.isHoveringOverDrop || this.isHoveringOverMe
	}
	@HostBinding('style.left.px') left = 0;
	@HostBinding('style.bottom.px') bottom = 0;

	hoveredOverlay$: Observable<any> = this.store$.select(overlaysStateSelector)
		.pluck<IOverlaysState, HoveredOverlayDropData>('hoveredOverlay')
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck<IOverlaysState, Map<any, any>>('overlays')))
		.map(([hoveredOverlay, overlays]: [HoveredOverlayDropData, Map<any, any>]) => [
			hoveredOverlay,
			overlays.get(hoveredOverlay && hoveredOverlay.overlayId)
		])
		.distinctUntilChanged();

	@HostListener('mouseover')
	onMouseOver() {
		this.isHoveringOverMe = true;
	}

	@HostListener('mouseout')
	onMouseOut() {
		this.isHoveringOverMe = false;
	}

	constructor(
		public store$: Store<IOverlaysState>,
		@Inject(DOCUMENT) protected document: Document
	) {
	}

	ngOnInit() {
		this._subscriptions.push(
			this.hoveredOverlay$.subscribe(this.showOrHide.bind(this))
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}

	showOrHide([eventData, overlay]: [HoveredOverlayDropData, Overlay]) {
		if (eventData && overlay) {
			this.left = eventData.drop_x - 50;
			this.bottom = this.document.body.offsetHeight - eventData.drop_y + 10;
			this.overlayId = eventData.overlayId;
			this.isHoveringOverDrop = true;
			this.overlay = overlay;
			this.formattedTime = getTimeFormat(new Date(this.overlay.photoTime));
		} else {
			this.isHoveringOverDrop = false;
		}
	}

	onDblClick() {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id: this.overlayId }));
	}
}
