import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { GEO_FILTERS } from '../../models/combo-boxes.model';
import { CaseGeoFilter } from '../../../menu-items/cases/models/case.model';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { IStatusBarState, selectGeoFilterSearchMode } from '../../reducers/status-bar.reducer';
import { tap } from 'rxjs/operators';
import { SearchMode } from '../../models/search-mode.enum';
import { ClearActiveInteractionsAction } from '../../../menu-items/tools/actions/tools.actions';
import { UpdateGeoFilterStatus } from '../../actions/status-bar.actions';

@Component({
	selector: 'ansyn-location-picker',
	templateUrl: './location-picker.component.html',
	styleUrls: ['./location-picker.component.less']
})
@AutoSubscriptions()
export class LocationPickerComponent implements OnInit, OnDestroy {
	_currentGeoFilter: SearchMode;
	set currentGeoFilter(value: SearchMode) {
		this._currentGeoFilter = value;
		this.store$.dispatch(new UpdateGeoFilterStatus({ searchMode: value, active: true }));
	}

	get currentGeoFilter(): SearchMode {
		return this._currentGeoFilter;
	}

	@AutoSubscription
	getActiveGeoFilter$ = this.store$.select(selectGeoFilterSearchMode).pipe(
		tap( searchMode => {
			this.currentGeoFilter = searchMode || this.geoFilters[0];
		})
	);

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(GEO_FILTERS) public geoFilters: CaseGeoFilter[]) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.store$.dispatch(new UpdateGeoFilterStatus({ active: false }));
	}

}
