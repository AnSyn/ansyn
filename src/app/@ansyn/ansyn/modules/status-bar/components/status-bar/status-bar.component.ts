import { Component, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { COMPONENT_MODE, ComponentVisibilityItems } from '../../../../app-providers/component-mode';
import { ComponentVisibilityService } from '../../../../app-providers/component-visibility.service';
import { UpdateFacetsAction } from '../../../filters/actions/filters.actions';
import { SelectMenuItemFromOutsideAction } from '@ansyn/menu';
import { MenuItemsKeys } from '../../../../config/ansyn.config';
import { selectEnableOnlyFavorites, selectShowOnlyFavorites } from '../../../filters/reducer/filters.reducer';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

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
	//
	onlyFavorite: boolean;
	@Input() version;

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

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

	constructor(
		private translateService: TranslateService,
		protected store: Store,
		componentVisibilityService: ComponentVisibilityService,
		@Inject(COMPONENT_MODE) public componentMode: boolean
	) {
		this.isSplitMapsShow = componentVisibilityService.get(ComponentVisibilityItems.SCREENS);
		this.isLayersShow = componentVisibilityService.get(ComponentVisibilityItems.LAYERS);
		this.isFavoritesShow = componentVisibilityService.get(ComponentVisibilityItems.FAVORITES);
		this.isSearchShow = componentVisibilityService.some([ComponentVisibilityItems.RESULT_TABLE, ComponentVisibilityItems.TIMELINE]);
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

}
