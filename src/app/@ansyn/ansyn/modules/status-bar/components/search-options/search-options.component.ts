import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';
import { OpenAdvancedSearchFromOutsideAction, ToggleAdvancedSearchAction, ToggleSimpleSearchAction } from '../../actions/status-bar.actions';
import { selectAdvancedSearchStatus, selectCalenderStatus, selectIsOpenedFromOutside, selectSimpledSearchStatus } from '../../reducers/status-bar.reducer';

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
		withLatestFrom(this.store$.select(selectCalenderStatus), this.store$.select(selectIsOpenedFromOutside)),
		filter(([clickoutside , calenderStatus,  isOpenedFromOutside]) => !calenderStatus  ),
		tap(([clickoutside , calenderStatus,  isOpenedFromOutside]) => {
			if (!isOpenedFromOutside) { // todo: add to the clickoutside service class to ignore
				this.close();
			}
			else {
				this.store$.dispatch(new OpenAdvancedSearchFromOutsideAction(false));
			}
		}));
		
	@AutoSubscription
	updateIsSimpleSearchOpen$ = this.store$.select(selectSimpledSearchStatus).pipe(
		tap((isSimpleSearchOpen: boolean) => {
			this.isExpand = isSimpleSearchOpen;
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
		this.store$.dispatch(new ToggleSimpleSearchAction(!this.isExpand));
	}

	close() {
		this.store$.dispatch(new ToggleSimpleSearchAction(false));
		this.store$.dispatch(new ToggleAdvancedSearchAction(false));
	}
}
