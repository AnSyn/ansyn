import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { cloneDeep, flattenDeep } from 'lodash';
import { IMultipleOverlaysSourceConfig, IOverlaysSourceProvider, MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { Options } from '@angular-slider/ngx-slider';
import {  GeoRegisterationOptions } from '../../../overlays/models/overlay.model';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap } from 'rxjs/operators';
import { IAdvancedSearchParameter, IProviderData } from '../../models/statusBar-config.model';
import { casesConfig } from '../../../menu-items/cases/services/cases.service';
import { ICasesConfig } from '../../../menu-items/cases/models/cases-config';
import { selectAdvancedSearchParameters } from '../../../overlays/reducers/overlays.reducer';
import { TranslateService } from '@ngx-translate/core';
import { OverlaysConfig, OverlaysService } from '../../../overlays/services/overlays.service';
import { SearchAction } from '../../actions/status-bar.actions';
import { selectMarkedSecondSearchSensors } from '../../reducers/status-bar.reducer';
import { IOverlaysConfig } from '../../../overlays/models/overlays.config';

@Component({
	selector: 'ansyn-advanced-search',
	templateUrl: './advanced-search.component.html',
	styleUrls: ['./advanced-search.component.less']
	})
	@AutoSubscriptions()
	export class AdvancedSearchComponent implements OnInit, OnDestroy {

	sliderOptions: Options = {
		floor: this.advancedSearchParametredFromConfig.resolution.lowValue,
		ceil: this.advancedSearchParametredFromConfig.resolution.highValue,
		translate: (value: number): string => this.translationService.instant(' cm ') + value
	};
	providersNamesList: string[];
	sensorTypes: string[];
	isGeoRegistered: string[] = Object.values(GeoRegisterationOptions);
	sensorsList: string[];

	selectedProvidersNames: string[] = [];
	allProviders: IProviderData[] = [];

	selectedAdvancedSearchParameters: IAdvancedSearchParameter = {};
	showMessage: boolean;

	@AutoSubscription
	onDataInputFilterChange$ = this.store.pipe(
	select(selectAdvancedSearchParameters),
	filter(Boolean),
	tap((searchOptions: IAdvancedSearchParameter) => {
		this.selectedAdvancedSearchParameters = cloneDeep(searchOptions);
		this.selectedProvidersNames = this.selectedAdvancedSearchParameters.providers.map(provider => provider.name);
	}));

	@AutoSubscription
	markSecondSearchSensors$ = this.store.pipe(
		select(selectMarkedSecondSearchSensors),
		filter((isSecondSearchRun: boolean) => isSecondSearchRun),
		tap(() => {
			this.selectedAdvancedSearchParameters.sensors.push(...this.overlaysConfig.sensorsForSecondSearch);
			this.overlaysConfig.sensorsForSecondSearch.forEach(sensor => {
				this.updateSelectedTypesBySensor(sensor);
			})
		})
	)
	get advancedSearchParametredFromConfig() {
		return this.caseConfig.defaultCase.state.advancedSearchParameters;
	}

	constructor(protected store: Store<any>,
				@Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				protected _parent: SearchPanelComponent,
				protected translationService: TranslateService,
				@Inject(casesConfig) public caseConfig: ICasesConfig,
				@Inject(OverlaysConfig) public overlaysConfig: IOverlaysConfig,
				protected overlaysService: OverlaysService) {
		this.sensorTypes = this.getAllSensorsTypes();
		this.sensorsList = this.overlaysService.getAllSensorsNames();
		this.providersNamesList = this.getAllProvidersNames();
	}

	displaySensors(): boolean {
		return Boolean(this.sensorsList.length);
	}
	getAllProvidersNames(): string[] {
		const allProvider = Object.keys(this.multipleOverlaysSourceConfig.indexProviders);
		const providers = allProvider.filter(provider => !this.multipleOverlaysSourceConfig.indexProviders[provider].inActive)

		return providers;
	}

	ngOnDestroy(): void {
	}

	getCurrentAdvancedSearchParameters(): IAdvancedSearchParameter {
		return  {
			types: this.selectedAdvancedSearchParameters.types,
			registeration: this.selectedAdvancedSearchParameters.registeration,
			resolution: this.selectedAdvancedSearchParameters.resolution,
			providers: this.selectedAdvancedSearchParameters.providers,
			sensors: this.selectedAdvancedSearchParameters.sensors
		}
	}


	getAllSensorsTypes(): string[] {
		const allSensors = Object.values(this.multipleOverlaysSourceConfig.indexProviders).filter(provider => !provider.inActive).map(provider => {
			return provider.dataInputFiltersConfig.children.map(sensor => sensor.text);
		});
		return flattenDeep(allSensors);
	}

	ngOnInit(): void {
		this.allProviders = this.advancedSearchParametredFromConfig.providers;
	}

	search(): void {
		const params = this.getCurrentAdvancedSearchParameters();
		if (this.isValid(params)) {
			this.store.dispatch(new SearchAction({advancedSearchParameters: params}));
			this._parent.close();
		} else {
			this.showMessage = true;
		}
	}

	isValid(params: IAdvancedSearchParameter): boolean {
		return params?.registeration?.length > 0
			|| params?.types?.length > 0
			|| params?.sensors?.length > 0
			|| params?.providers?.length > 0;
	}

	updateSelectedTypes(selectedTypesArray: string[]): void {
		const changedType = this.getUniqueElement(selectedTypesArray, this.selectedAdvancedSearchParameters.types);
		this.updateSelectedProvidersByType(changedType);
		this.selectedAdvancedSearchParameters.types = selectedTypesArray;
		this.updateSelectedSensorsByTypes(selectedTypesArray);
	}

	updateSelectedProviders(selectedProvidersArray: string[]): void {
		const changedProvider = this.getUniqueElement(selectedProvidersArray, this.selectedProvidersNames);
		this.updateSelectedTypesByProviders(selectedProvidersArray, changedProvider);
		this.selectedProvidersNames = selectedProvidersArray;
		this.updateSelectedProvidersByProviderNames();
	}

	updateSelectedRegistration(selectedRegistrationArray: string[]): void {
		this.selectedAdvancedSearchParameters.registeration = selectedRegistrationArray;
	}

	updateSelectedSensors(selectedSensorsArray: string[]): void {
		const changedSensor = this.getUniqueElement(selectedSensorsArray, this.selectedAdvancedSearchParameters.sensors)
		this.selectedAdvancedSearchParameters.sensors = selectedSensorsArray;
		this.updateSelectedTypesBySensor(changedSensor);
	}

	updateSelectedArray(selectedItemsArray: string[], arrayToUpdate: string): void {
		this.showMessage = false;
		this[`update${arrayToUpdate}`](selectedItemsArray);
	}

	updateSelectedTypesBySensor(changedSensor: string): void {
		this.overlaysService.getActiveProviders()
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
				const typesNames = Object.keys(sensorNamesByGroup);
				const selectedType = this.selectedAdvancedSearchParameters.types;
				const selectedSensors = this.selectedAdvancedSearchParameters.sensors;
				typesNames.map(type => {
					const sensorsListByType = sensorNamesByGroup[type];
					const isSensorContainedInType =  sensorsListByType.includes(changedSensor);
					const isTypeSelected = selectedType.includes(type);
					const isAnySensorOfThisTypeSelected = Boolean(sensorsListByType.find(sensor => selectedSensors.includes(sensor)));

					if (isSensorContainedInType && isTypeSelected && !isAnySensorOfThisTypeSelected) {
						const typeIndex = selectedType.indexOf(type);
						this.selectedAdvancedSearchParameters.types.splice(typeIndex, 1);
					} else if (isSensorContainedInType && !isTypeSelected) {
						this.selectedAdvancedSearchParameters.types.push(type);
					}
				});
		});
	}

	updateSelectedProvidersByProviderNames(): void {
		this.selectedAdvancedSearchParameters.providers = [];
		this.selectedProvidersNames.filter(providerName => this.selectedProvidersNames.includes(providerName)).map(selectedProviderName => {
			this.selectedAdvancedSearchParameters.providers.push(...this.allProviders.filter(provider => provider.name === selectedProviderName))
		})
	}

	updateSelectedSensorsByTypes(selectedTypesArray: string[]): void {
		this.selectedAdvancedSearchParameters.sensors = [];
		let sensorsToActivate: any[] = [];
		this.overlaysService.getActiveProviders()
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
				if (sensorNamesByGroup) {
					const typesNames = Object.keys(sensorNamesByGroup);
					typesNames.filter(type => selectedTypesArray.includes(type)).map(type => {
							sensorsToActivate = sensorsToActivate.concat(sensorNamesByGroup[type]);
					});
				}
		});

		const sensorsToAdd = sensorsToActivate.filter(sensor => !this.selectedAdvancedSearchParameters.sensors.includes(sensor));
		this.selectedAdvancedSearchParameters.sensors = this.selectedAdvancedSearchParameters.sensors.concat(sensorsToAdd);
	}

	updateSelectedProvidersByType(changedType: string): void {
		this.overlaysService.getActiveProviders()
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
				dataInputFiltersConfig.children.filter(type => type.text === changedType && !this.selectedProvidersNames.includes(providerName)).map(() => {
					this.selectedProvidersNames.push(providerName);
					this.updateSelectedProvidersByProviderNames();
				});
			}
		);
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
		let typesToActivate = [];
		this.overlaysService.getActiveProviders()
			.filter(([providerName]: [string, IOverlaysSourceProvider]) => providerName === changedProvider)
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
				typesToActivate = dataInputFiltersConfig.children.map(children => children);
		});

		if (Boolean(selectedProviders.includes(changedProvider))) {
			this.selectedProvidersNames = selectedProviders;
			const selectedTypesToActivate = [...typesToActivate.filter(type => !this.selectedAdvancedSearchParameters.types.includes(type.text)).map(type => type.text)];
			this.selectedAdvancedSearchParameters.types = this.selectedAdvancedSearchParameters.types.concat(selectedTypesToActivate);
		} else {
			typesToActivate.filter(type => this.selectedAdvancedSearchParameters.types.includes(type.text)).map(type => {
				this.selectedAdvancedSearchParameters.types = this.selectedAdvancedSearchParameters.types.filter(selected => selected !== type.text);
			})
		}
	}

	selectAllItems(): void {
		this.selectedProvidersNames = this.providersNamesList;
		this.updateSelectedProvidersByProviderNames();
		this.selectedAdvancedSearchParameters.types = this.sensorTypes;
		this.selectedAdvancedSearchParameters.sensors = this.sensorsList;
	}

	resetDataInputFilters(): void {
		if (this.selectedAdvancedSearchParameters.enableResetProviders) {
			this.selectedProvidersNames = [];
			this.selectedAdvancedSearchParameters.providers = [];
		}
		this.selectedAdvancedSearchParameters.types = [];
		this.selectedAdvancedSearchParameters.sensors = [];
	}

	resetResolution(): void {
		this.selectedAdvancedSearchParameters.resolution.lowValue = this.advancedSearchParametredFromConfig.resolution.lowValue;
		this.selectedAdvancedSearchParameters.resolution.highValue =  this.advancedSearchParametredFromConfig.resolution.highValue;
	}

}
