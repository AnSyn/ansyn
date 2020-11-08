import { Component, OnDestroy, OnInit } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectDropsDescending } from '../../../../overlays/reducers/overlays.reducer';
import { map } from 'rxjs/operators';
import { IOverlayDrop } from '../../../../overlays/models/overlay.model';

@Component({
	selector: 'ansyn-results',
	templateUrl: './results.component.html',
	styleUrls: ['./results.component.less'],
	animations: [
		trigger('expand', [
			transition(':enter', [
				style({ transform: 'translateY(100%)' }),
				animate('1.25s ease-in-out', style({ transform: 'translateY(0%)' }))
			])
		])
	]
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

	onExpandStart(): void {
		const resultsTableElement = document.querySelector('.results');
		resultsTableElement.setAttribute('style', `z-index: 5`);
	}
}
