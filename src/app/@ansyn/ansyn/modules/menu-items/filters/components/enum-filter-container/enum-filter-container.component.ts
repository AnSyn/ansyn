import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
	selector: 'ansyn-enum-filter-container',
	templateUrl: './enum-filter-container.component.html',
	styleUrls: ['./enum-filter-container.component.less']
})
export class EnumFilterContainerComponent implements OnChanges {
	@Input() metadata: EnumFilterMetadata;
	@Input() isLongFiltersList: boolean;
	@Output() onMetadataChange = new EventEmitter<EnumFilterMetadata>();
	@Input() filtersSearchResult: any;
	fields = [];

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
				.map(([key, value]) => ({ key, value }))
				.filter(({ key }) => (
					this.filtersSearchResult && (this.filtersSearchResult === 'all' || (this.filtersSearchResult || []).includes(key))
				));
		}
	}
}
