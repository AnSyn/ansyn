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
import { ICaseDataInputFiltersState, IDataInputFilterValue } from '../../../menu-items/cases/models/case.model';

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
  providersList: string[];
  sensorTypes: string[];
  dataFilters: string[];
  isGeoRegistered: string[] = Object.values(GeoRegisteration)
  
  selectedProviders: string[] =[];
  selectedTypes: string[] = [];
  selectedRegistration: string[] = [];

  @ViewChild('types') comboTableTypes: AnsynComboTableComponent;
  @ViewChild('providers') comboTableProviders: AnsynComboTableComponent;

  @AutoSubscription
  onDataInputFilterChange$ = this.store.pipe(
    select(selectAdvancedSearchParameters),
    tap((searchOptions: IAdvancedSearchParameter) => {
      if (searchOptions) {
        this.selectedTypes = searchOptions.types;
        this.selectedProviders = searchOptions.providers
        this.selectedRegistration = searchOptions.registeration;
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
    this.providersList = this.getAllProvidersNames();
    console.log(this.providersList);
    
  }
  getAllProvidersNames(): string[] {
    const provider: string[] = [];
    this.getAllDataInputFilter().forEach(element => {
      provider.push(element.value);
    });
    provider.push('happy')
    provider.push('birthday')
    provider.push('dear')
    provider.push('sleepy')
    provider.push('joe')
    provider.push('joe')
    provider.push('joe')

    return provider;

  }
  ngOnDestroy(): void {
    this.statusBarStore.dispatch(new UpdateAdvancedSearchParamAction({advancedSearchParameter: this.getCurrentAdvancedSearchParameters()}))
  }

  getCurrentAdvancedSearchParameters() {
    const resolution: IResolutionRange = {
      lowValue: this.minValue,
      highValue: this.maxValue
    }

    const dataInputFilters: ICaseDataInputFiltersState = {
      filters: this.getTypesToFilter()
    }

    return  {
      types: this.selectedTypes,
      registeration: this.selectedRegistration,
      resolution,
      dataInputFilters,
      providers: this.selectedProviders
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
			return parent.text;
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

  getTypesToFilter(): IDataInputFilterValue[] {
      const types: IDataInputFilterValue[] = [];
      const allTypesProvider = this.getAllDataInputFilter();
      allTypesProvider.forEach(provider => {
        provider.children.forEach(type => {
          if (this.selectedTypes.includes(type.text)) {
            types.push(type.value);
          }
        });
      })
      return types;
  }

  search() {
    console.log(this.getCurrentAdvancedSearchParameters());
    this.store.dispatch(new SetOverlaysCriteriaAction(this.getCurrentAdvancedSearchParameters()));
    this.store.dispatch(new UpdateAdvancedSearchParamAction({advancedSearchParameter: this.getCurrentAdvancedSearchParameters()}))
    this._parent.close();
  }

  updateSelectedArray(selectedItemsArray,arrayToUpdate) {
    switch (arrayToUpdate) {
      case 'selectedTypes' : {
        const changedType = this.getUniqueElement(selectedItemsArray, this.selectedTypes)[0];
        this.updateSelectedProvidersByType(selectedItemsArray, changedType);
        this.selectedTypes = selectedItemsArray;
        break;
      }
      case 'selectedRegistration' : {
        this.selectedRegistration = selectedItemsArray;
        break;
      }
      case 'selectedProviders' : {
        const changedProvider = this.getUniqueElement(selectedItemsArray, this.selectedProviders)[0];
        this.updateSelectedTypesByProviders(selectedItemsArray, changedProvider);
        this.selectedProviders = selectedItemsArray;
        break;
      }
    }
  }
  updateSelectedProvidersByType(selectedItemsArray: string[], changedType: string) {
    console.log(selectedItemsArray);
    Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
          dataInputFiltersConfig.children.forEach(type => {
            if(type.text === changedType && !this.selectedProviders.includes(providerName)) {
              this.comboTableProviders.selectOption(providerName);
            }
          });
				}
      );
  }
  
  getUniqueElement(selectedItemsArray: string[],elementArray: string[]) {
    return Boolean(elementArray.length > selectedItemsArray.length)? elementArray.filter(provider => selectedItemsArray.indexOf(provider) < 0) : selectedItemsArray.filter(provider => elementArray.indexOf(provider) < 0);
  }

  updateSelectedTypesByProviders(selectedItemsArray: string[], changedProvider: string) {
    const typesToActivate = [];
    Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => providerName === changedProvider)
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
            typesToActivate.push(...dataInputFiltersConfig.children);
				}
      );
    
      if (Boolean(selectedItemsArray.includes(changedProvider))) {
        this.selectedProviders = selectedItemsArray;
        typesToActivate.forEach(type => {
          if (!this.selectedTypes.includes(type.text)) {
            this.comboTableTypes.selectOption(type.text);
          }
        });
      } else {
        typesToActivate.forEach(type => {
          if (this.selectedTypes.includes(type.text)) {
            this.comboTableTypes.selectOption(type.text);
          }
        });
      }
  }

  // updateSelectedSensorsByTypes(selectedItemsArray: string[]) {
  //   const sensorsToActiveate: any[] = [];
  //   Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
	// 		.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
	// 		.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
  //         if(sensorNamesByGroup) {
  //           const typesNames = Object.keys(sensorNamesByGroup);
  //           typesNames.forEach(type => {
  //             if( selectedItemsArray.includes(type)) {
  //               sensorsToActiveate.push(...sensorNamesByGroup[type]);
  //             }
  //           })
  //         }
	// 			}
  //     );
  //     this.comboTableSensors.resetSelection()
  //     sensorsToActiveate.forEach(sensor => {
  //       if(!this.comboTableSensors.selected.includes(sensor))
  //       this.comboTableSensors.selectOption(sensor)
  //     })
      
  // }
  selectAllItems(selectedArrayToFill) {
    switch (selectedArrayToFill) {
      case 'types' : {
        this.comboTableTypes.selectAllOptions(this.sensorTypes)
        break;
      }
      case 'providers' : {
        this.comboTableProviders.selectAllOptions(this.providersList);
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
      case 'providers' : {
        this.comboTableProviders.resetSelection();
        break;
      }
      // case 'sensors' : {
      //   this.comboTableSensors.resetSelection();
      //   break;
      // }
      case 'resolution' : {
        this.minValue = 100;
        this.maxValue = 200;
      }
    }
  }
  
}
