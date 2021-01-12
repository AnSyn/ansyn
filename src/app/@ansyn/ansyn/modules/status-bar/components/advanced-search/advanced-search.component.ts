import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { flattenDeep } from 'lodash';
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
	};
	providersNamesList: string[];
	sensorTypes: string[];
	isGeoRegistered: string[] = Object.values(GeoRegisterationOptions);
	sensorsList: string[];

	selectedProvidersNames: string[] = [];
	selectedTypes: string[] = [];
	allProviders: IProviderData[] = [];
	selectedProviders: IProviderData[] = [];
	selectedRegistration: string[] = [];
	selectedSensors: string[] = [];

	enableResetProviders: boolean;

	@AutoSubscription
	onDataInputFilterChange$ = this.store.pipe(
	select(selectAdvancedSearchParameters),
	filter(Boolean),
	tap((searchOptions: IAdvancedSearchParameter) => {
		this.selectedTypes = searchOptions.types;
		this.selectedProviders = searchOptions.providers;
		this.selectedRegistration = searchOptions.registeration;
		this.sliderOptions.floor = searchOptions.resolution.lowValue;
		this.sliderOptions.ceil = searchOptions.resolution.highValue;
		this.selectedSensors = searchOptions.sensors;
		this.selectedProvidersNames = this.selectedProviders.map(provider => provider.name);
		this.enableResetProviders = searchOptions.enableResetProviders;
	}));

	constructor(protected store: Store<any>,
				@Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				protected _parent: SearchPanelComponent,
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

	getAllSensorsNames(): any[] {
		let sensors: any[] = [];
		this.getActiveProviders()
		.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
			if (sensorNamesByGroup) {
				const typesNames = Object.keys(sensorNamesByGroup);
				typesNames.map(type => {
					sensors = sensors.concat(sensorNamesByGroup[type].map(sensor => sensor));
				})
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
		const changedSensor = this.getUniqueElement(selectedSensorsArray, this.selectedSensors)
		this.selectedSensors = selectedSensorsArray;
		this.updateSelectedTypesBySensor(changedSensor);
	}

	updateSelectedArray(selectedItemsArray: string[], arrayToUpdate: string): void {
		this[`update${arrayToUpdate}`](selectedItemsArray);
	}

	updateSelectedTypesBySensor(changedSensor: string): void {
		this.getActiveProviders()
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
				if (sensorNamesByGroup) {
					const typesNames = Object.keys(sensorNamesByGroup);
					this.selectedTypes = this.selectedTypes.concat(typesNames.filter(type => sensorNamesByGroup[type].includes(changedSensor) && !this.selectedTypes.includes(type)));
				}
		});
	}

	updateSelectedProvidersByProviderNames(): void {
		this.selectedProviders = [];
		this.selectedProvidersNames.filter(providerName => this.selectedProvidersNames.includes(providerName)).map(selectedProviderName => {
			this.selectedProviders.push(...this.allProviders.filter(provider => provider.name === selectedProviderName))
		})
	}

	updateSelectedSensorsByTypes(selectedTypesArray: string[]): void {
		this.selectedSensors = [];
		let sensorsToActivate: any[] = [];
		this.getActiveProviders()
			.map(([providerName, { sensorNamesByGroup }]: [string, IOverlaysSourceProvider]) => {
				if (sensorNamesByGroup) {
					const typesNames = Object.keys(sensorNamesByGroup);
					typesNames.filter(type => selectedTypesArray.includes(type)).map(type => {
							sensorsToActivate = sensorsToActivate.concat(sensorNamesByGroup[type].map(sensor => sensor));
					});
				}
		});

		const sensorsToAdd = sensorsToActivate.filter(sensor => !this.selectedSensors.includes(sensor));
		this.selectedSensors = this.selectedSensors.concat(sensorsToAdd);
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
			const selectedTypesToActivate = [...typesToActivate.filter(type => !this.selectedTypes.includes(type.text)).map(type => type.text)];
			this.selectedTypes = this.selectedTypes.concat(selectedTypesToActivate);
		} else {
			typesToActivate.filter(type => this.selectedTypes.includes(type.text)).map(type => {
				this.selectedTypes = this.selectedTypes.filter(selected => selected !== type.text);
			})
		}
	}

	selectAllItems(): void {
		this.selectedProvidersNames = this.providersNamesList;
		this.updateSelectedProvidersByProviderNames();
		this.selectedTypes = this.sensorTypes;
		this.selectedSensors = this.sensorsList;
	}

	resetDataInputFilters(): void {
		if (this.enableResetProviders) {
			this.selectedProvidersNames = [];
			this.selectedProviders = [];
		}
		this.selectedTypes = [];
		this.selectedSensors = [];
	}

	resetResolution(): void {
		this.sliderOptions.floor = this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.lowValue;
		this.sliderOptions.ceil =  this.caseConfig.defaultCase.state.advancedSearchParameters.resolution.highValue;
	}

}
