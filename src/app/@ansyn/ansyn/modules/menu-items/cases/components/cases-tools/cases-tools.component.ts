import { Component, OnDestroy, OnInit } from '@angular/core';
import { selectCaseSaved, selectShowCasesTable } from '../../reducers/cases.reducer';
import { select, Store } from '@ngrx/store';
import { OpenModalAction } from '../../actions/cases.actions';
import { distinctUntilChanged, tap, map, delay } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectEnableOnlyFavorites, selectShowOnlyFavorites } from '../../../../filters/reducer/filters.reducer';
import { UpdateFacetsAction } from '../../../../filters/actions/filters.actions';
import { SelectMenuItemFromOutsideAction } from '@ansyn/menu';
import { MenuItemsKeys } from '../../../../../config/ansyn.config';
import { ComponentVisibilityService } from '../../../../../app-providers/component-visibility.service';
import { ComponentVisibilityItems } from '../../../../../app-providers/component-mode';

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
	// for component
	readonly isLayersShow: boolean;
	readonly isFavoritesShow: boolean;
	//
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

	constructor(protected store: Store<any>,
				componentVisibilityService: ComponentVisibilityService) {
		this.isLayersShow = componentVisibilityService.get(ComponentVisibilityItems.LAYERS);
		this.isFavoritesShow = componentVisibilityService.get(ComponentVisibilityItems.FAVORITES);
	}

	showOnlyFavorite() {
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }))
	}

	showCasesTable(elementRef: HTMLDivElement): void {
		this.store.dispatch(new SelectMenuItemFromOutsideAction({ name: MenuItemsKeys.Cases, elementRef, toggleFromBottom: false }))
	}

	showLayersTable(elementRef: HTMLDivElement): void {
		this.store.dispatch(new SelectMenuItemFromOutsideAction({ name: MenuItemsKeys.DataLayers, elementRef, toggleFromBottom: false }))
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	showSaveModal() {
		this.store.dispatch(new OpenModalAction({type: 'save'}))
	}
}
