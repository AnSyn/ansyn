import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { flattenDeep } from 'lodash';
import { IMultipleOverlaysSourceConfig, IOverlaysSourceProvider, MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { Options } from '@angular-slider/ngx-slider'
import { GeoRegisteration , IResolutionRange } from '../../../overlays/models/overlay.model';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { UpdateAdvancedSearchParamAction } from '../../actions/status-bar.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { IAdvancedSearchParameter, IProviderData } from '../../models/statusBar-config.model';
import { selectAdvancedSearchParameters } from '../../../overlays/reducers/overlays.reducer';
import { casesConfig } from '../../../menu-items/cases/services/cases.service';
import { ICasesConfig } from '../../../menu-items/cases/models/cases-config';

@Component({
	selector: 'ansyn-advanced-search',
	templateUrl: './advanced-search.component.html',
	styleUrls: ['./advanced-search.component.less']
	})
	@AutoSubscriptions()
	export class AdvancedSearchComponent implements OnInit, OnDestroy {

	sliderOptions: Options = {
		floor: this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.lowValue,
		ceil: this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.highValue,
		translate: (value: number): string => {
			return value + ' mm ';
		},
		getPointerColor: (value: number): string => {
			return 'gray';
		},
		getSelectionBarColor: (value: number): string => {
			return 'gray';
		}
	};
	providersNamesList: string[];
	sensorTypes: string[];
	isGeoRegistered: string[] = Object.values(GeoRegisteration);
	sensorsList: string[];

	selectedProvidersNames: string[] = [];
	selectedTypes: string[] = [];
	allProviders: IProviderData[] = [];
	selectedProviders: IProviderData[] = [];
	selectedRegistration: string[] = [];
	selectedSensors: string[] = [];

	@AutoSubscription
	onDataInputFilterChange$ = this.store.pipe(
	select(selectAdvancedSearchParameters),
	tap((searchOptions: IAdvancedSearchParameter) => {
		this.selectedTypes = searchOptions.types;
		this.selectedProviders = searchOptions.providers;
		this.selectedRegistration = searchOptions.registeration;
		this.sliderOptions.floor = searchOptions.resolution.lowValue;
		this.sliderOptions.ceil = searchOptions.resolution.highValue;
		this.selectedSensors = searchOptions.sensors;
		this.selectedProvidersNames = this.selectedProviders.map(provider => provider.name);
	}));

	constructor(protected store: Store<any>,
				@Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				protected _parent: SearchPanelComponent,
				@Inject(casesConfig) public caseConfig: ICasesConfig) { 
		this.sensorTypes = this.getAllSensorsTypes();
		this.providersNamesList = this.getAllProvidersNames();
	}

	getAllProvidersNames(): string[] {
		const allProvider = Object.keys(this.multipleOverlaysSourceConfig.indexProviders);
		const providers = allProvider.filter(provider => !this.multipleOverlaysSourceConfig.indexProviders[provider].inActive)

		return providers;
	}

	ngOnDestroy(): void {
		this.store.dispatch(new UpdateAdvancedSearchParamAction(this.getCurrentAdvancedSearchParameters()))
	}

	getCurrentAdvancedSearchParameters(): IAdvancedSearchParameter {
		const resolution: IResolutionRange = {
			lowValue: this.sliderOptions.floor,
			highValue: this.sliderOptions.ceil
		}
		
		return  {
			types: this.selectedTypes,
			registeration: this.selectedRegistration,
			resolution,
			providers: this.selectedProviders,
			sensors: this.selectedSensors
		}
	}

	getAllSensorsTypes(): string[] {
		const allSensors: string[] = [];
		Object.values(this.multipleOverlaysSourceConfig.indexProviders).filter(provider => !provider.inActive).map(provider => {
			provider.dataInputFiltersConfig.children.map(sensor => {
				allSensors.push(sensor.text)
			});
		});
		return flattenDeep(allSensors);
	}

	ngOnInit(): void {
		this.allProviders = this.caseConfig.defaultCase.state.advancedSearchParameters.providers;
	}

	search(): void {
		this.store.dispatch(new UpdateAdvancedSearchParamAction(this.getCurrentAdvancedSearchParameters()));
		this.store.dispatch(new SetOverlaysCriteriaAction({advancedSearchParameters: this.getCurrentAdvancedSearchParameters()}));
		this._parent.close();
	}

	updateSelectedTypes(selectedTypesArray: string[]): void {
		const changedType = this.getUniqueElement(selectedTypesArray, this.selectedTypes);
		this.updateSelectedProvidersByType(changedType);
		this.selectedTypes = selectedTypesArray;
		this.updateSelectedSensorsByTypes(selectedTypesArray);
	}

	updateSelectedProviders(selectedProvidersArray: string[]): void {
		const changedProvider = this.getUniqueElement(selectedProvidersArray, this.selectedProvidersNames);
		this.updateSelectedTypesByProviders(selectedProvidersArray, changedProvider);
		this.selectedProvidersNames = selectedProvidersArray;
		this.updateSelectedProvidersByProviderNames();
	}

	updateSelectedRegistration(selectedRegistrationArray: string[]): void {
		this.selectedRegistration = selectedRegistrationArray;
	}

	updateSelectedSensors(selectedSensorsArray: string[]): void {
		this.selectedRegistration = selectedSensorsArray;
	}

	updateSelectedArray(selectedItemsArray: string[], arrayToUpdate: string): void {
		this[`update${arrayToUpdate}`](selectedItemsArray);
	}

	updateSelectedProvidersByProviderNames(): void {
		this.selectedProviders = [];
		this.selectedProvidersNames.map(providerName => {
			if (this.selectedProvidersNames.includes(providerName)) {
				this.selectedProviders.push(...this.allProviders.filter(provider => provider.name === providerName));
			}
		});
	}

	updateSelectedSensorsByTypes(selectedTypesArray: string[]): void {
		const sensorsToActiveate: any[] = [];
		this.getActiveProviders()
				.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
			  if(sensorNamesByGroup) {
				const typesNames = Object.keys(sensorNamesByGroup);
				typesNames.map(type => {
				  if(selectedTypesArray.includes(type)) {
					sensorsToActiveate.push(...sensorNamesByGroup[type]);
				  }
				})
			  }
			}
		  );
		const sensorsToAdd = sensorsToActiveate.filter(sensor => !this.selectedSensors.includes(sensor));
		sensorsToAdd.push(...this.selectedSensors);
		this.selectedSensors = sensorsToAdd;
	  }

	updateSelectedProvidersByType(changedType: string): void {
		this.getActiveProviders()
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
				dataInputFiltersConfig.children.forEach(type => {
				if (type.text === changedType && !this.selectedProvidersNames.includes(providerName)) {
					this.selectedProvidersNames.push(providerName);
					this.updateSelectedProvidersByProviderNames();
				}
				});
			}
		);
	}

	private getActiveProviders(): any[] {
		return Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
		.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive);
	}
	private isExistInArray(itemsArray: string[], element: string): boolean {
		return itemsArray.indexOf(element) < 0;
	}

	getUniqueElement(currentArray: string[], afterChangeArray: string[]): string {
		return Boolean(afterChangeArray.length > currentArray.length) ? 
		afterChangeArray.find(provider => this.isExistInArray(currentArray, provider)) : 
		currentArray.find(provider => this.isExistInArray(afterChangeArray, provider));
	}

	updateSelectedTypesByProviders(selectedProviders: string[], changedProvider: string): void {
		const typesToActivate = [];
		this.getActiveProviders()
			.filter(([providerName]: [string, IOverlaysSourceProvider]) => providerName === changedProvider)
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
				typesToActivate.push(...dataInputFiltersConfig.children);
		});
		
		this.selectedTypes = this.selectedTypes.slice();
		if (Boolean(selectedProviders.includes(changedProvider))) {
		this.selectedProvidersNames = selectedProviders;
		typesToActivate.forEach(type => {
			if (!this.selectedTypes.includes(type.text)) {
				this.selectedTypes.push(type.text);
			}
		});
		} else {
		typesToActivate.forEach(type => {
			if (this.selectedTypes.includes(type.text)) {
				this.selectedTypes = this.selectedTypes.filter(selected => selected !== type.text);
			}
		});
		}
	}

	selectAllItems(): void {
		this.selectedProvidersNames = this.providersNamesList;
		this.updateSelectedProvidersByProviderNames();
		this.selectedTypes = this.sensorTypes;
	}
	
	resetDataInputFilters(): void {
		this.selectedProvidersNames = [];
		this.selectedProviders = [];
		this.selectedTypes = [];
		this.selectedSensors = [];
	}

	resetResolution(): void {
		this.sliderOptions.floor = this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.lowValue;
		this.sliderOptions.ceil =  this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.highValue;
	}
	
}
