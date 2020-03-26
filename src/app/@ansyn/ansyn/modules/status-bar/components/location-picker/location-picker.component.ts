import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { GEO_FILTERS } from '../../models/combo-boxes.model';
import { CaseGeoFilter } from '../../../menu-items/cases/models/case.model';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { UpdateGeoFilterStatus } from '../../actions/status-bar.actions';

@Component({
	selector: 'ansyn-location-picker',
	templateUrl: './location-picker.component.html',
	styleUrls: ['./location-picker.component.less']
})
export class LocationPickerComponent implements OnInit, OnDestroy {
	@Input() geoFilter: CaseGeoFilter;

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(GEO_FILTERS) public geoFilters: CaseGeoFilter[]) {
	}

	change(type) {
		this.store$.dispatch(new UpdateGeoFilterStatus({ type }));
	}

	ngOnInit() {
		this.store$.dispatch(new UpdateGeoFilterStatus({ active: true }));
	}

	ngOnDestroy(): void {
		this.store$.dispatch(new UpdateGeoFilterStatus());
	}
}
