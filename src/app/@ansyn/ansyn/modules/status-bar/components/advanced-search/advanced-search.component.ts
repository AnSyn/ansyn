import { Component, Inject, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { flattenDeep } from 'lodash';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IMultipleOverlaysSourceConfig, IOverlaysSourceProvider, MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { IFiltersConfig } from '../../../filters/models/filters-config';
import { IFilter } from '../../../filters/models/IFilter';
import { FilterMetadata } from '../../../filters/models/metadata/filter-metadata.interface';
import { FiltersMetadata, IFiltersState, selectFiltersMetadata, selectFiltersSearchResults } from '../../../filters/reducer/filters.reducer';
import { filtersConfig } from '../../../filters/services/filters.service';

@Component({
  selector: 'ansyn-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.less']
})
export class AdvancedSearchComponent implements OnInit {

  sensorTypes: any[];
	dataFilters: any[];
  isGeoRegistered: any[] = ['Geo Registered','Not Geo Registered']
  
  constructor(@Inject(filtersConfig) protected config: IFiltersConfig,
              protected store: Store<IFiltersState>,
              @Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
                private translate: TranslateService) { 
    this.dataFilters = this.getAllDataInputFilter();
    this.sensorTypes = this.selectAll();
  }

  getAllDataInputFilter(): any[] {
		const dataInputs = Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
			.map(([providerName, { dataInputFiltersConfig, showOnlyMyChildren }]: [string, IOverlaysSourceProvider]) => {
					if (showOnlyMyChildren) {
						return dataInputFiltersConfig.children.map(child => {
							return this.buildDataFilter(providerName, child);
						})
					} else {
						return {
							...dataInputFiltersConfig,
							children: dataInputFiltersConfig.children.map(child => this.buildDataFilter(providerName, child))
						}
					}
				}
			);

		return flattenDeep(dataInputs);
  }
  
  buildDataFilter(providerName, filter) {
		return {
			text: this.translate.instant(filter.text),
			value: {
				...filter.value,
				providerName
			},
			collapsed: false,
			children: []
		}
  }
  
  selectAllChildren(parent) {
		if (this.isChild(parent)) {
			return parent.value.sensorType;
		}
		return parent.children.map( child => this.selectAllChildren(child));
  }
  
  private isChild(filter) {
		return !filter.children || filter.children.length === 0;
  }
  
  selectAll() {
		return flattenDeep(this.dataFilters.map(filter => this.selectAllChildren(filter)));
  }
  
  ngOnInit(): void {
  }

  typeChanged(type) {
    //dispacth action that inform the type changed
  }

}
