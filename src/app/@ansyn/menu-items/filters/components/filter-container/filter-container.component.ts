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
import { IFiltersConfig } from '@ansyn/menu-items/filters/models/filters-config';
import { filtersConfig } from '@ansyn/menu-items/filters/services/filters.service';
import { FilterType } from '@ansyn/core/models/case.model';

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
	public isLongFiltersList = false;
	public showOnlyFavorite = false;
	public isGotSmallListFromProvider = true;
	public metadataFromState: FilterMetadata;
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
		})
		.filter(() => this.filter.type === FilterType.Enum && Boolean(this.metadataFromState))
		.do(() => {
			this.isGotSmallListFromProvider = (<EnumFilterMetadata>this.metadataFromState).enumsFields.size <= this.config.shortFilterListLength;
		});

	showOnlyFavorites$: Observable<any> = this.store.select(filtersStateSelector)
		.pluck<IFiltersState, boolean>('showOnlyFavorites')
		.distinctUntilChanged()
		.do((showOnlyFavorites) => {
			this.showOnlyFavorite = showOnlyFavorites;
			this.isLongFiltersList = false;
		});

	constructor(protected store: Store<IFiltersState>, @Inject(filtersConfig) protected config: IFiltersConfig) {
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

	toggleShowMoreLess(): void {
		this.isLongFiltersList = !this.isLongFiltersList;
	}
}
