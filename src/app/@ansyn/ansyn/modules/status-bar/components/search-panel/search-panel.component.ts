import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import * as momentNs from 'moment';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { IStatusBarState, selectGeoFilterActive, selectGeoFilterType } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { animate, style, transition, trigger, AnimationTriggerMetadata } from '@angular/animations';
import { filter, tap } from 'rxjs/operators';
import { selectDataInputFilter, selectRegion } from '../../../overlays/reducers/overlays.reducer';
import { CaseRegionState, ICaseDataInputFiltersState } from '../../../menu-items/cases/models/case.model';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import {
	IMultipleOverlaysSourceConfig,
	IOverlaysSourceProvider,
	MultipleOverlaysSourceConfig
} from '../../../core/models/multiple-overlays-source-config';
import { SetToastMessageAction } from '@ansyn/map-facade';
import {
	LogSearchPanelPopup,
} from '../../../overlays/actions/overlays.actions';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';
import { SearchOptionsComponent } from '../search-options/search-options.component';

const moment = momentNs;

const fadeAnimations: AnimationTriggerMetadata = trigger('fade', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(-100%)' }),
		animate('0.2s', style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))' }))
	]),
	transition(':leave', [
		style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))' }),
		animate('0.2s', style({ opacity: 0, transform: 'translateY(-100%)' }))
	])
]);

type SearchPanelTitle = 'DataInputs' | 'LocationPicker';

@Component({
	selector: 'ansyn-search-panel',
	templateUrl: './search-panel.component.html',
	styleUrls: ['./search-panel.component.less'],
	animations: [fadeAnimations]
})
@AutoSubscriptions()
export class SearchPanelComponent implements OnInit, OnDestroy {
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
				dateTimeAdapter: DateTimeAdapter<any>,
				protected _parent: SearchOptionsComponent
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
	close() {
		this._parent.close()
	}
}
