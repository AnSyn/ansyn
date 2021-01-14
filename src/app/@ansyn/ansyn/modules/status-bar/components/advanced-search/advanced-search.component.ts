import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { cloneDeep, flattenDeep } from 'lodash';
import { IMultipleOverlaysSourceConfig, IOverlaysSourceProvider, MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { Options } from '@angular-slider/ngx-slider'
import {  GeoRegisterationOptions, IResolutionRange } from '../../../overlays/models/overlay.model';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap } from 'rxjs/operators';
import { IAdvancedSearchParameter, IProviderData } from '../../models/statusBar-config.model';
import { casesConfig } from '../../../menu-items/cases/services/cases.service';
import { ICasesConfig } from '../../../menu-items/cases/models/cases-config';
import { selectAdvancedSearchParameters } from '../../../overlays/reducers/overlays.reducer';
import { TranslateService } from '@ngx-translate/core';

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
		translate: (value: number): string => this.translationService.instant(' cm ') + value
	};
	providersNamesList: string[];
	sensorTypes: string[];
	isGeoRegistered: string[] = Object.values(GeoRegisterationOptions);
	sensorsList: string[];

	selectedProvidersNames: string[] = [];
	allProviders: IProviderData[] = [];
	lowValue = 0;
	highValue = 0;

	selectedAdvancedSearchParameters: IAdvancedSearchParameter = {}
	@AutoSubscription
	onDataInputFilterChange$ = this.store.pipe(
	select(selectAdvancedSearchParameters),
	filter(Boolean),
	tap((searchOptions: IAdvancedSearchParameter) => {
		this.selectedAdvancedSearchParameters = cloneDeep(searchOptions);
		this.lowValue = searchOptions.resolution.lowValue;
		this.highValue = searchOptions.resolution.highValue;
		this.selectedProvidersNames = this.selectedAdvancedSearchParameters.providers.map(provider => provider.name);
	}));

	constructor(protected store: Store<any>,
				@Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				protected _parent: SearchPanelComponent,
				protected translationService: TranslateService,
				@Inject(casesConfig) public caseConfig: ICasesConfig) {
		this.sensorTypes = this.getAllSensorsTypes();
		this.sensorsList = this.getAllSensorsNames();
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
		const resolution: IResolutionRange = {
			lowValue: this.lowValue,
			highValue: this.highValue
		}

		return  {
			types: this.selectedAdvancedSearchParameters.types,
			registeration: this.selectedAdvancedSearchParameters.registeration,
			resolution,
			providers: this.selectedAdvancedSearchParameters.providers,
			sensors: this.selectedAdvancedSearchParameters.sensors
		}
	}

	getAllSensorsNames(): any[] {
		let sensors: any[] = [];
		this.getActiveProviders()
		.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
			if (sensorNamesByGroup) {
				const typesNames = Object.keys(sensorNamesByGroup);
				typesNames.forEach(type => {
					sensors = sensors.concat(sensorNamesByGroup[type]);
				});
			}
		});
		return flattenDeep(sensors);
	}

	getAllSensorsTypes(): string[] {
		const allSensors = Object.values(this.multipleOverlaysSourceConfig.indexProviders).filter(provider => !provider.inActive).map(provider => {
			return provider.dataInputFiltersConfig.children.map(sensor => sensor.text);
		});
		return flattenDeep(allSensors);
	}

	ngOnInit(): void {
		this.allProviders = this.caseConfig.defaultCase.state.advancedSearchParameters.providers;
	}

	search(): void {
		this.store.dispatch(new SetOverlaysCriteriaAction({advancedSearchParameters: this.getCurrentAdvancedSearchParameters()}));
		this._parent.close();
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
		this[`update${arrayToUpdate}`](selectedItemsArray);
	}

	updateSelectedTypesBySensor(changedSensor: string): void {
		this.getActiveProviders()
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
				const typesNames = Object.keys(sensorNamesByGroup);
				const selectedType = this.selectedAdvancedSearchParameters.types;
				const typeToActivate = typesNames.find(type => {
					const sensorsListByType = sensorNamesByGroup[type];
					const isSensorContainedInType =  sensorsListByType.includes(changedSensor);
					const isSelected = selectedType.includes(type);
					return isSensorContainedInType && !isSelected;
				});
				this.selectedAdvancedSearchParameters.types.push(typeToActivate);
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
		this.getActiveProviders()
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
		this.getActiveProviders()
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
				dataInputFiltersConfig.children.filter(type => type.text === changedType && !this.selectedProvidersNames.includes(providerName)).map(() => {
					this.selectedProvidersNames.push(providerName);
					this.updateSelectedProvidersByProviderNames();
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
		let typesToActivate = [];
		this.getActiveProviders()
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
		this.lowValue = this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.lowValue;
		this.highValue =  this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.highValue;
	}

}
