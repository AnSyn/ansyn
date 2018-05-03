import { Component, HostBinding, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {
	IOverlaysState,
	MarkUpClass,
	MarkUpData,
	overlaysStateSelector
} from '@ansyn/overlays/reducers/overlays.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { getTimeFormat } from '@ansyn/core/utils/time';
import { DOCUMENT } from '@angular/common';
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp
} from '@ansyn/overlays/actions/overlays.actions';
import { ExtendMap } from '@ansyn/overlays/reducers/extendedMap.class';

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

	@HostBinding('class.show') isHoveringOverDrop = false;
	@HostBinding('style.left.px') left = 0;
	@HostBinding('style.bottom.px') bottom = 0;

	hoveredOverlay$: Observable<any> = this.store$.select(overlaysStateSelector)
		.pluck <IOverlaysState, ExtendMap<MarkUpClass, MarkUpData>>('dropsMarkUp')
		.withLatestFrom((this.store$.select(overlaysStateSelector).pluck<IOverlaysState, Map<any, any>>('overlays')))
		.map(([markupMap, overlays]: [ExtendMap<MarkUpClass, MarkUpData>, Map<any, any>]) =>
			overlays.get(markupMap && markupMap.get(MarkUpClass.hover).overlaysIds[0])
		)
		.distinctUntilChanged();

	// Mark the original overlay as un-hovered when mouse leaves
	@HostListener('mouseleave')
	onMouseOut() {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
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

	showOrHide(overlay: Overlay) {
		if (overlay) {
			this.overlayId = overlay.id;
			const hoveredElement: Element = this.document.body.querySelector(`#dropId-${this.overlayId}`);
			if (hoveredElement) {
				const hoveredElementBounds: ClientRect = hoveredElement.getBoundingClientRect();
				this.left = hoveredElementBounds.left - 50;
				this.bottom = this.document.body.offsetHeight - hoveredElementBounds.top;
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
