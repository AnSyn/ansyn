import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectDropsDescending } from '../../../../overlays/reducers/overlays.reducer';
import { map } from 'rxjs/operators';
import { IOverlayDrop } from '../../../../overlays/models/overlay.model';

@Component({
	selector: 'ansyn-results',
	templateUrl: './results.component.html',
	styleUrls: ['./results.component.less']
})

@AutoSubscriptions()
export class ResultsComponent implements OnInit, OnDestroy {
	toggleResults = false;

	@AutoSubscription
	overlaysCount$: Observable<number> = this.store$
		.pipe(
			select(selectDropsDescending),
			map((overlays: IOverlayDrop[]) => overlays.length || 0)
		);

	constructor(protected store$: Store<any>) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	toggleResultsTable(): void {
		this.toggleResults = !this.toggleResults;
	}
}
