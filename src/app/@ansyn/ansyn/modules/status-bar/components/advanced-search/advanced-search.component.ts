import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { flattenDeep } from 'lodash';
import { IMultipleOverlaysSourceConfig, IOverlaysSourceProvider, MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { Options } from '@angular-slider/ngx-slider'
import { GeoRegisteration, IResolutionRange } from '../../../overlays/models/overlay.model';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { UpdateAdvancedSearchParamAction } from '../../actions/status-bar.actions';
import { selectAdvancedSearchParameters } from '../../reducers/status-bar.reducer';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { IAdvancedSearchParameter, IProviderData, IStatusBarConfig } from '../../models/statusBar-config.model';
import { StatusBarConfig } from '../../models/statusBar.config';

@Component({
	selector: 'ansyn-advanced-search',
	templateUrl: './advanced-search.component.html',
	styleUrls: ['./advanced-search.component.less']
	})
	@AutoSubscriptions()
	export class AdvancedSearchComponent implements OnInit, OnDestroy {

	minValue = 100;
	maxValue = 200;
	sliderOptions: Options = {
		floor: 100,
		ceil: 200,
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
		if (searchOptions) {
			this.selectedTypes = searchOptions.types;
			this.selectedProviders = searchOptions.providers;
			this.selectedRegistration = searchOptions.registeration;
			this.minValue = searchOptions.resolution.lowValue;
			this.maxValue = searchOptions.resolution.highValue;
			this.selectedSensors = searchOptions.sensors;
			this.selectedProvidersNames = this.selectedProviders.map(provider => provider.name);
		}}));

	constructor(protected store: Store<any>,
				@Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				private translate: TranslateService,
				protected _parent: SearchPanelComponent,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) { 
		this.sensorTypes = this.getAllSensorsTypes();
		this.providersNamesList = this.getAllProvidersNames();
	}

	getAllProvidersNames(): string[] {
		const allProvider = Object.keys(this.multipleOverlaysSourceConfig.indexProviders);
		const providers = allProvider.filter(provider => !this.multipleOverlaysSourceConfig.indexProviders[provider].inActive)
		
		providers.push('happy')
		providers.push('birthday')
		providers.push('dear')
		providers.push('sleepy')
		providers.push('joe')
		providers.push('joe')
		providers.push('joe')
		providers.push('happy')
		providers.push('birthday')
		providers.push('dear')
		providers.push('sleepy')
		providers.push('joe')
		providers.push('joe')
		providers.push('joe')
	
		return providers;
	}

	ngOnDestroy(): void {
		this.store.dispatch(new UpdateAdvancedSearchParamAction(this.getCurrentAdvancedSearchParameters()))
	}

	getCurrentAdvancedSearchParameters(): IAdvancedSearchParameter {
		const resolution: IResolutionRange = {
			lowValue: this.minValue,
			highValue: this.maxValue
		}
		
		return  {
			types: this.selectedTypes,
			registeration: this.selectedRegistration,
			resolution,
			providers: this.selectedProviders,
			sensors: this.selectedSensors
		}
	}

	getAllSensorsTypes() {
		const allSensors: string[] = []
		Object.values(this.multipleOverlaysSourceConfig.indexProviders).filter(provider => !provider.inActive).map(provider => {
			provider.dataInputFiltersConfig.children.map(sensor => {
				allSensors.push(sensor.text)
			});
		});
		return flattenDeep(allSensors);
	}

	ngOnInit(): void {
		this.allProviders = this.statusBarConfig.defaultAdvancedSearchParameters.providers;
	}

	search() {
		this.store.dispatch(new UpdateAdvancedSearchParamAction(this.getCurrentAdvancedSearchParameters()));
		this.store.dispatch(new SetOverlaysCriteriaAction(this.getCurrentAdvancedSearchParameters()));
		this._parent.close();
	}

	updateSelectedTypes(selectedTypesArray) {
		const changedType = this.getUniqueElement(selectedTypesArray, this.selectedTypes)[0];
		this.updateSelectedProvidersByType(changedType);
		this.selectedTypes = selectedTypesArray;
		this.updateSelectedSensorsByTypes(selectedTypesArray);
	}

	updateSelectedProviders(selectedProvidersArray) {
		const changedProvider = this.getUniqueElement(selectedProvidersArray, this.selectedProvidersNames)[0];
		this.updateSelectedTypesByProviders(selectedProvidersArray, changedProvider);
		this.selectedProvidersNames = selectedProvidersArray;
		this.updateSelectedProvidersByProviderNames();
	}

	updateSelectedRegistration(selectedRegistrationArray) {
		this.selectedRegistration = selectedRegistrationArray;
	}

	updateSelectedSensors(selectedSensorsArray) {
		this.selectedRegistration = selectedSensorsArray;
	}

	updateSelectedArray(selectedItemsArray, arrayToUpdate) {
		this[`update${arrayToUpdate}`](selectedItemsArray);
	}

	updateSelectedProvidersByProviderNames() {
		this.selectedProviders = [];
		this.selectedProvidersNames.map(providerName => {
			if (this.selectedProvidersNames.includes(providerName)) {
				this.selectedProviders.push(...this.allProviders.filter(provider => provider.name === providerName));
			}
		});
	}

	updateSelectedSensorsByTypes(selectedTypesArray: string[]) {
		const sensorsToActiveate: any[] = [];
		Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
				.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
				.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
			  if(sensorNamesByGroup) {
				const typesNames = Object.keys(sensorNamesByGroup);
				typesNames.forEach(type => {
				  if( selectedTypesArray.includes(type)) {
					sensorsToActiveate.push(...sensorNamesByGroup[type]);
				  }
				})
			  }
					}
		  );
		const sensorsToAdd = sensorsToActiveate.filter(sensor => !this.selectedSensors.includes(sensor));
		sensorsToAdd.push(...this.selectedSensors);
		this.selectedSensors = sensorsToAdd;
		
		// this.selectedSensors.push(...sensorsToActiveate.filter(sensor => !this.selectedSensors.includes(sensor)))
	  }

	updateSelectedProvidersByType(changedType: string) {
		Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
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

	getUniqueElement(selectedItemsArray, elementArray) {
		return Boolean(elementArray.length > selectedItemsArray.length) ? elementArray.filter(provider => selectedItemsArray.indexOf(provider) < 0) : selectedItemsArray.filter(provider => elementArray.indexOf(provider) < 0);
	}

	updateSelectedTypesByProviders(selectedProviders, changedProvider) {
		const typesToActivate = [];
		Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
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

	selectAllItems() {
		this.selectedProvidersNames = this.providersNamesList;
		this.updateSelectedProvidersByProviderNames();
		this.selectedTypes = this.sensorTypes;
	}

	resetSelection(selectedArrayToFill) {
		switch (selectedArrayToFill) {
			case 'providers' :
			case 'types': {
				this.selectedProvidersNames = [];
				this.selectedProviders = [];
				this.selectedTypes = [];
				break;
			}
			case 'resolution' : {
				this.minValue = 100;
				this.maxValue = 200;
				break;
			}
		}
	}
}
