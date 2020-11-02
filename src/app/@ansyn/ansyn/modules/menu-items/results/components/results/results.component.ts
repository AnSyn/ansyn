import { Component, OnInit } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { AutoSubscription } from 'auto-subscriptions';
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
export class ResultsComponent implements OnInit {
	toggleResults = false;

	@AutoSubscription
	overlaysCount$: Observable<any> = this.store$
		.pipe(
			select(selectDropsDescending),
			map((overlays: IOverlayDrop[]) => overlays.length || 0)
		);

	constructor(protected store$: Store<any>) {
	}

	ngOnInit() {
	}

	toggleResultsTable(): void {
		this.toggleResults = !this.toggleResults;
	}

	onExpandStart() {
		const resultsTableElement = document.querySelector('.results');
		if (resultsTableElement) {
			// resultsTableElement.setAttribute('style', `z-index: 16`);
			resultsTableElement.setAttribute('style', `bottom: 12vh`);
		}
	}
}
