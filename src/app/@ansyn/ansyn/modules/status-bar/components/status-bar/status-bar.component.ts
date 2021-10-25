import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ComponentVisibilityItems } from '../../../../app-providers/component-mode';
import { ComponentVisibilityService } from '../../../../app-providers/component-visibility.service';
import { UpdateFacetsAction } from '../../../filters/actions/filters.actions';
import { SelectMenuItemFromOutsideAction } from '@ansyn/menu';
import { MenuItemsKeys } from '../../../../config/ansyn.config';
import { selectEnableOnlyFavorites, selectShowOnlyFavorites } from '../../../filters/reducer/filters.reducer';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectFourViewsMode, UpdateMapSizeAction } from '@ansyn/map-facade';
import { selectStatusBarVisibilityState } from '../../reducers/status-bar.reducer';
import { ToggleStatusBar } from '../../actions/status-bar.actions';
import { from } from 'rxjs';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})
@AutoSubscriptions()
export class StatusBarComponent implements OnInit, OnDestroy {
	// for component
	readonly isSplitMapsShow: boolean;
	readonly isLayersShow: boolean;
	readonly isFavoritesShow: boolean;
	readonly isSearchShow: boolean;
	readonly isCasesLineShow: boolean;
	readonly isToolsLineShow: boolean;
	//
	onlyFavorite: boolean;
	@ViewChild('wrappedElement', {static: true}) wrapperElement: ElementRef;
	@Input() version;

	visibilityState: boolean;
	onlyFavoriteEnable$ = this.store.pipe(
		select(selectEnableOnlyFavorites),
		distinctUntilChanged(),
		map((enable) => !enable)
	);

	@AutoSubscription
	onChangeVisibilityState$ = this.store.select(selectStatusBarVisibilityState).pipe(
		switchMap(this.onChangeVisibilityState.bind(this)),
		tap( () => this.store.dispatch(new UpdateMapSizeAction()))
	);

	@AutoSubscription
	onlyFavoriteSelected$ = this.store.pipe(
		select(selectShowOnlyFavorites),
		distinctUntilChanged(),
		tap((showFavorite) => this.onlyFavorite = showFavorite)
	);

	fourViewsMode$ = this.store.select(selectFourViewsMode);

	constructor(
		protected store: Store,
		protected el: ElementRef,
		componentVisibilityService: ComponentVisibilityService
	) {
		this.isSplitMapsShow = componentVisibilityService.get(ComponentVisibilityItems.SCREENS);
		this.isLayersShow = componentVisibilityService.get(ComponentVisibilityItems.LAYERS);
		this.isFavoritesShow = componentVisibilityService.get(ComponentVisibilityItems.FAVORITES);
		this.isSearchShow = componentVisibilityService.some([ComponentVisibilityItems.RESULT_TABLE, ComponentVisibilityItems.TIMELINE]);
		this.isCasesLineShow = componentVisibilityService.some([ComponentVisibilityItems.CASES, ComponentVisibilityItems.LAYERS, ComponentVisibilityItems.FAVORITES]);
		this.isToolsLineShow = componentVisibilityService.isOneToolsActive() || this.isSplitMapsShow;

	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	showOnlyFavorite() {
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }))
	}

	showLayersTable(elementRef: HTMLDivElement): void {
		this.store.dispatch(new SelectMenuItemFromOutsideAction({
			name: MenuItemsKeys.DataLayers,
			elementRef,
			toggleFromBottom: false
		}))
	}

	onChangeVisibilityState(state) {
		this.visibilityState = state;
		const opacity = state ? 1 : 0;
		const visibility = state ? 'visible' : 'hidden';
		const height = state ? '' : '0';
		const position = state ? '' : 'absolute';
		this.wrapperElement.nativeElement.style.height = height;
		let animate = this.el.nativeElement.animate([
			{opacity, visibility}
		], {duration: 250, fill: 'forwards'})
		return from(animate.finished)
	}

	toggleStatusBar() {
		this.store.dispatch(new ToggleStatusBar(!this.visibilityState));
	}
}
