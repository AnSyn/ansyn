import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { GEO_FILTERS } from '../../models/combo-boxes.model';
import { CaseGeoFilter } from '../../../menu-items/cases/models/case.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { IStatusBarState, selectGeoFilterSearchMode } from '../../reducers/status-bar.reducer';
import { tap } from 'rxjs/operators';
import { SearchMode, SearchModeEnum } from '../../models/search-mode.enum';
import { UpdateGeoFilterStatus } from '../../actions/status-bar.actions';

@Component({
	selector: 'ansyn-location-picker',
	templateUrl: './location-picker.component.html',
	styleUrls: ['./location-picker.component.less']
})
@AutoSubscriptions()
export class LocationPickerComponent implements OnInit, OnDestroy {
	_currentGeoFilter: SearchMode;
	private lastGeo: CaseGeoFilter;
	set currentGeoFilter(value: SearchMode) {
		this._currentGeoFilter = value === SearchModeEnum.none ? this.lastGeo : value;
		this.lastGeo = this._currentGeoFilter;
		requestAnimationFrame(() => {
			this.store$.dispatch(new UpdateGeoFilterStatus({ searchMode: this._currentGeoFilter, indicator: value !== SearchModeEnum.none }));
		})
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
		this.lastGeo = geoFilters[0];
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.store$.dispatch(new UpdateGeoFilterStatus({ indicator: false }));
	}

}
