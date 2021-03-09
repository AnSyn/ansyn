import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { IStatusBarState, selectAdvancedSearchStatus, selectGeoFilterActive, selectGeoFilterType } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store, select } from '@ngrx/store';
import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';
import { tap, take } from 'rxjs/operators';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import {
	IMultipleOverlaysSourceConfig,
	MultipleOverlaysSourceConfig
} from '../../../core/models/multiple-overlays-source-config';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';
import { SearchOptionsComponent } from '../search-options/search-options.component';
import { ToggleAdvancedSearchAction, UpdateGeoFilterStatus } from '../../actions/status-bar.actions';
import { selectFourViewsMode } from '@ansyn/map-facade';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

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

@Component({
	selector: 'ansyn-search-panel',
	templateUrl: './search-panel.component.html',
	styleUrls: ['./search-panel.component.less'],
	animations: [fadeAnimations]
})

@AutoSubscriptions()
export class SearchPanelComponent implements OnInit, OnDestroy{

	advancedSearchActive: boolean;
	fourViewsMode: boolean;

	geoFilterTitle$ = this.store$.pipe(select(selectGeoFilterType));
	geoFilterActive$ = this.store$.pipe(select(selectGeoFilterActive));

	@AutoSubscription
	advancedSearchActive$ = this.store$.select(selectAdvancedSearchStatus).pipe(
		tap(advancedSearchActive => this.advancedSearchActive = advancedSearchActive)
	);

	@AutoSubscription
	fourViewsMode$ = this.store$.select(selectFourViewsMode).pipe(
		tap(fourViewsMode => this.fourViewsMode = fourViewsMode)
	);

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				@Inject(MultipleOverlaysSourceConfig) private multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				@Inject(COMPONENT_MODE) public componentMode: boolean,
				protected _parent: SearchOptionsComponent,
				dateTimeAdapter: DateTimeAdapter<any>
	) {
		dateTimeAdapter.setLocale(statusBarConfig.locale);
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	toggleGeoFilter() {
		this.geoFilterActive$.pipe(
			take(1),
			tap( (active: boolean) => this.store$.dispatch(new UpdateGeoFilterStatus({active: !active})))
		).subscribe();
	}

	toggleAdvancedSearch() {
		this.advancedSearchActive$.pipe(
			take(1),
			tap( (active: boolean) => this.store$.dispatch(new ToggleAdvancedSearchAction(!active)))
		).subscribe();
	}
	close() {
		this._parent.close()
	}
}
