import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { HoveredOverlayData } from '@ansyn/overlays/models/hovered-overlay-data.model';

@Component({
	selector: 'ansyn-overlay-overview',
	templateUrl: './overlay-overview.component.html',
	styleUrls: ['./overlay-overview.component.css']
})
export class OverlayOverviewComponent implements OnInit, OnDestroy {
	private _subscriptions: Subscription[] = [];

	hoveredOverlay$: Observable<HoveredOverlayData> = this.store$.select(overlaysStateSelector)
		.pluck<IOverlaysState, HoveredOverlayData>('hoveredOverlay')
		.distinctUntilChanged();

	constructor(protected store$: Store<IOverlaysState>) {
	}

	ngOnInit() {
		this._subscriptions.push(
			this.hoveredOverlay$.subscribe((eventData: HoveredOverlayData) => {
					console.log('hover data', eventData);
				}
			)
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}
}
