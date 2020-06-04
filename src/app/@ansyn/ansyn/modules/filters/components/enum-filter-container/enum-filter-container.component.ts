import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EnumFilterCounters } from '../../models/counters/enum-filter-counters';

@Component({
	selector: 'ansyn-enum-filter-container',
	templateUrl: './enum-filter-container.component.html',
	styleUrls: ['./enum-filter-container.component.less']
})
export class EnumFilterContainerComponent implements OnChanges {
	@Input() metadata: EnumFilterMetadata;
	@Input() counters: EnumFilterCounters;
	@Input() isLongFiltersList: boolean;
	@Output() onMetadataChange = new EventEmitter<EnumFilterMetadata>(true);
	@Input() filtersSearchResult: any;
	fields: { key: any, value: any, filteredCount: number }[] = [];

	onInputClicked(key: string) {
		this.metadata.updateMetadata(key);
		this.onMetadataChange.emit(this.metadata);
	}

	selectOnly(key: any) {
		this.metadata.selectOnly(key);
		this.onMetadataChange.emit(this.metadata);
	}

	ngOnChanges(changes: SimpleChanges): void {
		const defined = this.metadata && this.filtersSearchResult;
		const changed = changes.metadata || changes.filtersSearchResult;
		if (defined && changed) {
			this.fields = Array.from(this.metadata.enumsFields)
				.map(([key, value]) => ({ key, value, filteredCount: this.counters.enumsFields.get(key)?.filteredCount }))
				.filter(({ key }) => (
					this.filtersSearchResult && (this.filtersSearchResult === 'all' || (this.filtersSearchResult || []).includes(key))
				));
		}
	}
}
