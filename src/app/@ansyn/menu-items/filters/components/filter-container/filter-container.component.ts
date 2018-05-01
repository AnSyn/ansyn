import { UpdateFilterAction } from '../../actions/filters.actions';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { filtersStateSelector, IFiltersState } from '../../reducer/filters.reducer';
import { Observable } from 'rxjs/Observable';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import 'rxjs/add/operator/distinctUntilChanged';

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
	subscribers = [];

	@Input() filter;
	@ViewChild('fields') fields: ElementRef;


	metadataFromState$: Observable<any> = this.store
		.select(filtersStateSelector)
		.distinctUntilChanged()
		.map((state: IFiltersState) => {
			return state.filters;
		});

	showOnlyFavorites$: Observable<any> = this.store.select(filtersStateSelector)
		.pluck<IFiltersState, boolean>('showOnlyFavorites')
		.distinctUntilChanged()
		.do((showOnlyFavorites) => this.showOnlyFavorite = showOnlyFavorites);

	constructor(protected store: Store<IFiltersState>) {
	}

	get disabledShowAll() {
		return !this.metadataFromState || this.showOnlyFavorite;
	}

	ngOnInit() {
		this.subscribers.push(
			this.metadataFromState$.subscribe((filters) => {
				this.metadataFromState = cloneDeep(filters.get(this.filter));
			}),
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
}
