import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { flattenDeep } from 'lodash';
import { IMultipleOverlaysSourceConfig, IOverlaysSourceProvider, MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { IFiltersConfig } from '../../../filters/models/filters-config';
import { IFiltersState } from '../../../filters/reducer/filters.reducer';
import { filtersConfig } from '../../../filters/services/filters.service';
import { Options } from '@angular-slider/ngx-slider'
@Component({
  selector: 'ansyn-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.less']
})
export class AdvancedSearchComponent implements OnInit {

  minValue: number = 100;
  maxValue: number = 200;
  options: Options = {
    floor: 100,
    ceil: 200,
    translate: (value: number): string => {
      return value + ' mm';
    },
    getPointerColor: (value: number): string => {
      if (value < 100) {
          return 'red';
      }
      return 'gray';
    },
    getSelectionBarColor: (value: number): string => {
      if (value < 100) {
          return 'red';
      }
      return 'gray';
    }
  };
  sensorTypes: any[];
  dataFilters: any[];
  sensorsList: any[];
  isGeoRegistered: any[] = ['Geo Registered','Not Geo Registered']
  
  constructor(protected store: Store<IFiltersState>,
              @Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
              private translate: TranslateService) { 
    this.dataFilters = this.getAllDataInputFilter();
    this.sensorTypes = this.selectAll();
    this.sensorsList = this.getAllSensorsNames();
  }

  getAllSensorsNames(): any[] {
    const sensors: any[] = [];
    const dataInputs = Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
          if(sensorNamesByGroup) {
             sensorNamesByGroup.sensors.forEach(sensor => sensors.push(sensor));
          }
				}
      );
      sensors.push('happy')
      sensors.push('birthday')
      sensors.push('dear')
      sensors.push('sleepy')
      sensors.push('joe')
      sensors.push('joe')
      sensors.push('joe')


		return flattenDeep(sensors);
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

  search() {

  }

}
