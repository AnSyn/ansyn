import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';
import { selectCalenderStatus } from '../../reducers/status-bar.reducer';

@Component({
	selector: 'ansyn-search-options',
	templateUrl: './search-options.component.html',
	styleUrls: ['./search-options.component.less']
})
@AutoSubscriptions()
export class SearchOptionsComponent implements OnInit, OnDestroy {

	isExpand: Boolean = false;

	@AutoSubscription
	isClickOutside$ = this.clickOutside.onClickOutside({ monitor: this.element.nativeElement }).pipe(
		filter(clickOutside => clickOutside),
		withLatestFrom(this.store$.select(selectCalenderStatus)),
		tap(([clickoutside , calenderStatus]) => {
			if (!calenderStatus) {
				this.close();
			}
		})
	);
	constructor(protected element: ElementRef,
		protected clickOutside: ClickOutsideService,
		protected store$: Store<any>) { }

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	toggleSearchPannel() {
		this.isExpand = !this.isExpand;
	}

	close() {
		this.isExpand = false;
	}
}
