import { Component, Inject, OnInit } from '@angular/core';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import { Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { combineLatest } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { COMPONENT_MODE } from 'src/app/@ansyn/ansyn/public_api';
import { IOverlaysSourceProvider, MultipleOverlaysSourceConfig, IMultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { ICaseDataInputFiltersState, CaseRegionState } from '../../../menu-items/cases/models/case.model';
import { LogSearchPanelPopup } from '../../../overlays/actions/overlays.actions';
import { selectDataInputFilter, selectRegion } from '../../../overlays/reducers/overlays.reducer';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { StatusBarConfig } from '../../models/statusBar.config';
import { selectGeoFilterType, selectGeoFilterActive, IStatusBarState } from '../../reducers/status-bar.reducer';

type SearchPanelTitle = 'DataInputs' | 'LocationPicker';

@Component({
  selector: 'ansyn-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.less']
})

export class AdvancedSearchComponent implements OnInit {
	popupExpanded = new Map<SearchPanelTitle, boolean>([['DataInputs', false], ['LocationPicker', false]]);
	dataInputFilterTitle: string;
	geoFilterTitle: string;
	geoFilterCoordinates: string;
	dataInputFilters: ICaseDataInputFiltersState;
	advancedSearch: Boolean = false;

	@AutoSubscription
	dataInputFilters$ = this.store$.select(selectDataInputFilter).pipe(
		filter((caseDataInputFiltersState: ICaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters)),
		tap((caseDataInputFiltersState: ICaseDataInputFiltersState) => {
			this.dataInputFilters = caseDataInputFiltersState;
			const selectedFiltersSize = this.dataInputFilters.filters.length;
			let dataInputsSize = 0;
			Object.values(this.multipleOverlaysSourceConfig.indexProviders)
				.filter(({ inActive }: IOverlaysSourceProvider) => !inActive)
				.forEach(({ dataInputFiltersConfig }) => dataInputsSize += dataInputFiltersConfig.children.length);
			this.dataInputFilterTitle = this.dataInputFilters.fullyChecked ? 'All' : `${ selectedFiltersSize }/${ dataInputsSize }`;
			if (!caseDataInputFiltersState.fullyChecked && caseDataInputFiltersState.filters.length === 0) {
				this.popupExpanded.set('DataInputs', true)
			}
		})
	);

	@AutoSubscription
	geoFilter$ = combineLatest([
		this.store$.select(selectGeoFilterType),
		this.store$.select(selectGeoFilterActive)
	]).pipe(
		tap(([geoFilterType, active]) => {
			this.geoFilterTitle = `${ geoFilterType }`;
		})
	);

	@AutoSubscription
	updateGeoFilterCoordinates$ = this.store$.select(selectRegion).pipe(
		filter(Boolean),
		tap((region: CaseRegionState) => {
			this.geoFilterCoordinates = region.geometry.coordinates.toString();
		})
	);

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				@Inject(MultipleOverlaysSourceConfig) private multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				@Inject(COMPONENT_MODE) public componentMode: boolean,
				dateTimeAdapter: DateTimeAdapter<any>
	) {
		dateTimeAdapter.setLocale(statusBarConfig.locale);
	}

	ngOnInit() {
	}

	toggleExpander(popupName: SearchPanelTitle, forceState?: boolean) {
		if (this.isDataInputsOk()) {
			const newState = forceState || !this.popupExpanded.get(popupName);
			if (newState) {
				this.store$.dispatch(new LogSearchPanelPopup({ popupName }));
			}
			this.popupExpanded.forEach((_, key, map) => {
				map.set(key, key === popupName ? newState : false)
			});
		} else {
			this.store$.dispatch(new SetToastMessageAction({
				toastText: 'Please select at least one type',
				showWarningIcon: true
			}));

		}
	}

	isActive(popup: SearchPanelTitle) {
		return this.popupExpanded.get(popup);
	}

	ngOnDestroy() {
	}

	isDataInputsOk() {
		return this.dataInputFilters.fullyChecked || this.dataInputFilters.filters.length > 0;
	}

	toggleAdvancedSearch() {
		this.advancedSearch = !this.advancedSearch
	}

}
