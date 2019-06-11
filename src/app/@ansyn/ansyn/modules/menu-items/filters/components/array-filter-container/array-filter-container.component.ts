import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ArrayFilterMetadata } from '../../models/metadata/array-filter-metadata';
import { FilterSearchResult } from '../../models/filter-search-results';

@Component({
	selector: 'ansyn-array-filter-container',
	templateUrl: './array-filter-container.component.html',
	styleUrls: ['./array-filter-container.component.less']
})
export class ArrayFilterContainerComponent implements OnChanges{
	@Input() metadata: ArrayFilterMetadata;
	@Input() filtersSearchResult: FilterSearchResult;
	@Output() onMetadataChange = new EventEmitter<ArrayFilterMetadata>();
	fields = [];

	onInputClicked(key: string) {
		this.metadata.updateMetadata(key);
		this.onMetadataChange.emit(this.metadata);
	}

	ngOnChanges(changes: SimpleChanges): void {
		const defined = this.metadata && this.filtersSearchResult;
		const changed = changes.metadata || changes.filtersSearchResult;
		if (defined && changed) {
			this.fields = Array.from(this.metadata.fields)
				.filter(([key]) => (
					this.filtersSearchResult && (this.filtersSearchResult === 'all' || (this.filtersSearchResult || []).includes(key))
				));
		}
	}
}
