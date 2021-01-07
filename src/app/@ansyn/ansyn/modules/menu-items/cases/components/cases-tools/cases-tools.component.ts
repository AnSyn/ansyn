import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICasesState, selectCaseSaved, selectShowCasesTable } from '../../reducers/cases.reducer';
import { select, Store } from '@ngrx/store';
import { OpenModalAction, ShowCasesTableAction } from '../../actions/cases.actions';
import { distinctUntilChanged, tap, map, delay } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectEnableOnlyFavorites, selectShowOnlyFavorites } from '../../../../filters/reducer/filters.reducer';
import { UpdateFacetsAction } from '../../../../filters/actions/filters.actions';
import { SelectMenuItemFromOutsideAction } from 'src/app/@ansyn/menu/actions/menu.actions';

@Component({
	selector: 'ansyn-cases-tools',
	templateUrl: './cases-tools.component.html',
	styleUrls: ['./cases-tools.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class CasesToolsComponent implements OnInit, OnDestroy {
	onlyFavorite: boolean;
	isTableOpen: boolean;

	onlyFavoriteEnable$ = this.store.pipe(
		select(selectEnableOnlyFavorites),
		distinctUntilChanged(),
		map((enable) => !enable)
	);

	currentSaveCase$ = this.store.pipe(
		select(selectCaseSaved),
		delay(0)
	);

	@AutoSubscription
	onlyFavoriteSelected$ = this.store.pipe(
		select(selectShowOnlyFavorites),
		distinctUntilChanged(),
		tap((showFavorite) => this.onlyFavorite = showFavorite)
	);

	@AutoSubscription
	isTableOpen$ = this.store.pipe(
		select(selectShowCasesTable),
		tap( open => this.isTableOpen = open)
	);

	constructor(protected store: Store<any>) {
	}

	showOnlyFavorite() {
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }))
	}

	showCasesTable(showCases: HTMLDivElement): void {
		this.store.dispatch(new SelectMenuItemFromOutsideAction({ menuKey: "CasesContainer", elementRef: showCases, triggerClass: 'top' }))
	}

	showLayersTable(showLayers: HTMLDivElement): void {
		this.store.dispatch(new SelectMenuItemFromOutsideAction({ menuKey: "DataLayers", elementRef: showLayers, triggerClass: 'top' }))
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	showSaveModal() {
		this.store.dispatch(new OpenModalAction({type: 'save'}))
	}
}
