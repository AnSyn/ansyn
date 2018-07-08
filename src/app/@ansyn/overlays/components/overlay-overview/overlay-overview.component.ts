import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { IOverlaysState, MarkUpClass, selectHoveredOverlay } from '@ansyn/overlays/reducers/overlays.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { getTimeFormat } from '@ansyn/core/utils/time';
import { DisplayOverlayFromStoreAction, SetMarkUp } from '@ansyn/overlays/actions/overlays.actions';
import { overlayOverviewComponentConstants } from '@ansyn/overlays/components/overlay-overview/overlay-overview.component.const';
import { TranslateService } from '@ngx-translate/core';

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

	protected topElement = this.el.nativeElement.parentElement;

	public get const() {
		return overlayOverviewComponentConstants
	}

	@HostBinding('class.show') isHoveringOverDrop = false;
	@HostBinding('style.left.px') left = 0;
	@HostBinding('style.top.px') top = 0;

	hoveredOverlay$: Observable<any> = this.store$.select(selectHoveredOverlay);

	// Mark the original overlay as un-hovered when mouse leaves
	@HostListener('mouseleave')
	onMouseOut() {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	constructor(
		public store$: Store<IOverlaysState>,
		protected el: ElementRef,
		protected translate: TranslateService
	) {
		translate.setDefaultLang('sns');
	}

	ngOnInit() {
		this._subscriptions.push(
			this.hoveredOverlay$.subscribe(this.onHoveredOverlay.bind(this))
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}

	onHoveredOverlay(overlay: Overlay) {
		if (overlay) {
			this.overlayId = overlay.id;
			const hoveredElement: Element = this.topElement.querySelector(`#dropId-${this.overlayId}`);
			if (hoveredElement) {
				const hoveredElementBounds: ClientRect = hoveredElement.getBoundingClientRect();
				this.left = hoveredElementBounds.left - 50;
				this.top = hoveredElementBounds.top;
				this.isHoveringOverDrop = true;
				this.overlay = overlay;
				this.formattedTime = getTimeFormat(new Date(this.overlay.photoTime));
			}
		} else {
			this.isHoveringOverDrop = false;
		}
	}

	onDblClick() {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id: this.overlayId }));
	}
}
