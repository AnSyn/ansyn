import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { HoveredOverlayData } from '@ansyn/overlays/models/hovered-overlay-data.model';

@Component({
	selector: 'ansyn-overlay-overview',
	templateUrl: './overlay-overview.component.html',
	styleUrls: ['./overlay-overview.component.less']
})
export class OverlayOverviewComponent implements OnInit, OnDestroy {
	private _subscriptions: Subscription[] = [];
	public x: number;
	public y: number;
	public showFlag = false;

	hoveredOverlay$: Observable<HoveredOverlayData> = this.store$.select(overlaysStateSelector)
		.pluck<IOverlaysState, HoveredOverlayData>('hoveredOverlay')
		.distinctUntilChanged();

	constructor(
		protected store$: Store<IOverlaysState>,
		protected element: ElementRef
	) {	}

	ngOnInit() {
		this._subscriptions.push(
			this.hoveredOverlay$.subscribe(this.showOrHide.bind(this))
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}

	showOrHide(eventData: HoveredOverlayData | null) {
		if (eventData) {
			this.element.nativeElement.style.left = (eventData.x - 50) + 'px';
			this.element.nativeElement.style.top = (eventData.y - 50) + 'px';
			this.showFlag = true;
		} else {
			this.showFlag = false;
		}
	}
}
