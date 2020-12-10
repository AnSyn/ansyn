import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { flattenDeep } from 'lodash';
import { IMultipleOverlaysSourceConfig, IOverlaysSourceProvider, MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { IFiltersState } from '../../../filters/reducer/filters.reducer';
import { Options } from '@angular-slider/ngx-slider'
import { GeoRegisteration, IOverlaysCriteria, IResolutionRange } from '../../../overlays/models/overlay.model';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { AnsynComboTableComponent } from '../../../core/forms/ansyn-combo-table/ansyn-combo-table.component';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { UpdateAdvancedSearchParamAction } from '../../actions/status-bar.actions';
import { IStatusBarState, selectAdvancedSearchParameters } from '../../reducers/status-bar.reducer';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { IAdvancedSearchParameter } from '../../models/statusBar-config.model';

@Component({
  selector: 'ansyn-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.less']
})
@AutoSubscriptions()
export class AdvancedSearchComponent implements OnInit, OnDestroy {

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
  isGeoRegistered: any[] = Object.values(GeoRegisteration)
  
  selectedTypes: any[] = [];
  selectedSensors: any[] = [];
  selectedRegistration: any[] = [];

  @ViewChild('types') comboTableTypes: AnsynComboTableComponent;
  @ViewChild('sensors') comboTableSensors: AnsynComboTableComponent;

  @AutoSubscription
  onDataInputFilterChange$ = this.store.pipe(
    select(selectAdvancedSearchParameters),
    tap((searchOptions: IAdvancedSearchParameter) => {
      if (searchOptions) {
        this.selectedTypes = searchOptions.types;
        this.selectedRegistration = searchOptions.registeration;
        this.selectedSensors = searchOptions.sensors;
        this.minValue = searchOptions.resolution.lowValue;
        this.maxValue = searchOptions.resolution.highValue;
      }
    })
  );

  constructor(protected store: Store<IFiltersState>,
              public statusBarStore: Store<IStatusBarState>,
              @Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
              private translate: TranslateService,
              protected _parent: SearchPanelComponent) { 
    this.dataFilters = this.getAllDataInputFilter();
    this.sensorTypes = this.selectAll();
    this.sensorsList = this.getAllSensorsNames();
  }
  ngOnDestroy(): void {
    this.statusBarStore.dispatch(new UpdateAdvancedSearchParamAction({advancedSearchParameter: this.getCurrentAdvancedSearchParameters()}))
  }

  getCurrentAdvancedSearchParameters(): IAdvancedSearchParameter {
    const resolution: IResolutionRange = {
      lowValue: this.minValue,
      highValue: this.maxValue
    }

    return  {
      types: this.selectedTypes,
      sensors: this.selectedSensors,
      registeration: this.selectedRegistration,
      resolution
    }
  }
  getAllSensorsNames(): any[] {
    const sensors: any[] = [];
    Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
          if(sensorNamesByGroup) {
            const typesNames = Object.keys(sensorNamesByGroup);
            typesNames.forEach(type => {
              sensorNamesByGroup[type].forEach(sensor => sensors.push(sensor));
            })
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


  search() {
    this.store.dispatch(new SetOverlaysCriteriaAction(this.getCurrentAdvancedSearchParameters()));
    this.store.dispatch(new UpdateAdvancedSearchParamAction({advancedSearchParameter: this.getCurrentAdvancedSearchParameters()}))
    this._parent.close();
  }

  updateSelectedArray(selectedItemsArray,arrayToUpdate) {
    switch (arrayToUpdate) {
      case 'selectedTypes' : {
        this.selectedTypes = selectedItemsArray;
        this.updateSelectedSensorsByTypes(selectedItemsArray)
        break;
      }
      case 'selectedSensors' : {
        this.selectedSensors = selectedItemsArray;
        break;
      }
      case 'selectedRegistration' : {
        this.selectedRegistration = selectedItemsArray;
        break;
      }
    }
  }

  updateSelectedSensorsByTypes(selectedItemsArray: string[]) {
    const sensorsToActiveate: any[] = [];
    Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
          if(sensorNamesByGroup) {
            const typesNames = Object.keys(sensorNamesByGroup);
            typesNames.forEach(type => {
              if( selectedItemsArray.includes(type)) {
                sensorsToActiveate.push(...sensorNamesByGroup[type]);
              }
            })
          }
				}
      );
      this.comboTableSensors.resetSelection()
      sensorsToActiveate.forEach(sensor => {
        if(!this.comboTableSensors.selected.includes(sensor))
        this.comboTableSensors.selectOption(sensor)
      })
      
  }
  selectAllItems(selectedArrayToFill) {
    switch (selectedArrayToFill) {
      case 'types' : {
        this.comboTableTypes.selectAllOptions(this.sensorTypes)
        this.comboTableSensors.selectAllOptions(this.sensorsList);
        break;
      }
      case 'sensors' : {
        this.comboTableSensors.selectAllOptions(this.sensorsList);
        break;
      }
    }
  }

  resetSelection(selectedArrayToFill) {
    switch (selectedArrayToFill) {
      case 'types' : {
        this.comboTableTypes.resetSelection();
        break;
      }
      case 'sensors' : {
        this.comboTableSensors.resetSelection();
        break;
      }
      case 'resolution' : {
        this.minValue = 100;
        this.maxValue = 200;
      }
    }
  }
  
}
