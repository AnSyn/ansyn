import { UpdateFilterAction } from '../../actions/filters.actions';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { filtersStateSelector, IFiltersState } from '../../reducer/filters.reducer';
import { Observable } from 'rxjs/Observable';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import 'rxjs/add/operator/distinctUntilChanged';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { MENU_ITEMS } from '@ansyn/menu/menu.module';
import { MenuItem } from '@ansyn/menu/models/menu-item.model';
import { IFiltersConfig } from '@ansyn/menu-items/filters/models/filters-config';
import { filtersConfig } from '@ansyn/menu-items/filters/services/filters.service';

@Component({
	selector: 'ansyn-filter-container',
	templateUrl: './filter-container.component.html',
	styleUrls: ['./filter-container.component.less'],
	animations: [
		trigger('rotateArrow', [
			state('true', style({
				transform: 'rotateZ(-45deg) translateY(35%) translateX(50%)'
			})),
			state('false', style({
				transform: 'rotateZ(135deg) translateY(-75%)'
			})),
			transition('1 <=> 0', animate('0.1s'))
		]),
		trigger('fieldsTrigger', [
			state('true', style({
				maxHeight: '5000px',
				opacity: 1
			})),
			state('false', style({
				maxHeight: '0',
				opacity: 0
			})),
			transition('1 <=> 0', animate('0.2s'))
		])
	]
})
export class FilterContainerComponent implements OnInit, OnDestroy {

	public show = true;
	public showOnlyFavorite = false;
	public metadataFromState: FilterMetadata;
	public shortMetadataFromState: FilterMetadata;
	public shownFilters: FilterMetadata;
	subscribers = [];

	@Input() filter;
	@ViewChild('fields') fields: ElementRef;


	metadataFromState$: Observable<any> = this.store
		.select(filtersStateSelector)
		.distinctUntilChanged()
		.map((state: IFiltersState) => {
			return state.filters;
		})
		.do(filters => {
			this.metadataFromState = cloneDeep(filters.get(this.filter));
			if (this.filter.type === 'Enum') {
				if (Boolean(this.metadataFromState)) {
					this.shortMetadataFromState = cloneDeep(this.metadataFromState);
					(<EnumFilterMetadata>this.shortMetadataFromState).enumsFields.trimMap(this.config.shortFilterListLength);
					this.shownFilters = cloneDeep(this.shortMetadataFromState);
				}
			}
		});

	showOnlyFavorites$: Observable<any> = this.store.select(filtersStateSelector)
		.pluck<IFiltersState, boolean>('showOnlyFavorites')
		.distinctUntilChanged()
		.do((showOnlyFavorites) => this.showOnlyFavorite = showOnlyFavorites);

	constructor(protected store: Store<IFiltersState>,  @Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	get disabledShowAll() {
		return !this.metadataFromState || this.showOnlyFavorite;
	}

	ngOnInit() {
		this.subscribers.push(
			this.metadataFromState$.subscribe(),
			this.showOnlyFavorites$.subscribe()
		);
	}

	ngOnDestroy() {
		this.subscribers.forEach(sub => sub.unsubscribe());
	}

	onMetadataChange(metadata: any): void {
		this.store.dispatch(new UpdateFilterAction({ filter: this.filter, newMetadata: metadata }));
	}

	showAll(): void {
		if (this.metadataFromState) {
			const clonedMetadata: FilterMetadata = Object.assign(Object.create(this.metadataFromState), this.metadataFromState);
			clonedMetadata.showAll();
			this.onMetadataChange(clonedMetadata);
		}
	}

	showMore(): void {
		if (this.filter.type === 'Enum') {
			this.shownFilters = this.metadataFromState;
		}
	}
}
