import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICasesState } from '../../reducers/cases.reducer';
import { select, Store } from '@ngrx/store';
import { ManualSaveAction, OpenModalAction } from '../../actions/cases.actions';
import { distinctUntilChanged, tap, map } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectEnableOnlyFavorites, selectShowOnlyFavorites } from '../../../../filters/reducer/filters.reducer';
import { UpdateFacetsAction } from '../../../../filters/actions/filters.actions';

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

	onlyFavoriteEnable$ = this.store.pipe(
		select(selectEnableOnlyFavorites),
		distinctUntilChanged(),
		map((enable) => !enable)
	);

	@AutoSubscription
	onlyFavoriteSelected$ = this.store.pipe(
		select(selectShowOnlyFavorites),
		distinctUntilChanged(),
		tap((showFavorite) => this.onlyFavorite = showFavorite)
	);

	constructor(protected store: Store<ICasesState>) {
	}

	showOnlyFavorite() {
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }))
	}

	showEditCaseModal(): void {
		this.store.dispatch(new OpenModalAction({ type: 'edit' }));
	}

	showSaveCaseModal(): void {
		this.store.dispatch(new OpenModalAction({ type: 'save' }));
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}
}
