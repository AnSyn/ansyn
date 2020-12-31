import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ICaseDataInputFiltersState, IDataInputFilterValue } from '../../../menu-items/cases/models/case.model';
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
	dataFilters: any[];
	isGeoRegistered: string[] = Object.values(GeoRegisteration);

	selectedProvidersNames: string[] = [];
	selectedTypes: string[] = [];
	allProviders: IProviderData[] = [];
	selectedProviders: IProviderData[] = [];
	selectedRegistration: string[] = [];

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
			this.selectedProvidersNames = this.selectedProviders.map(provider => provider.name);
		}}));

	constructor(protected store: Store<any>,
				@Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				private translate: TranslateService,
				protected _parent: SearchPanelComponent,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) { 
		this.dataFilters = this.getAllDataInputFilter();
		this.sensorTypes = this.getAllSensorsTypes();
		this.providersNamesList = this.getAllProvidersNames();
	}

	getAllProvidersNames(): string[] {
		const provider: string[] = [];
		this.dataFilters.forEach(element => {
			provider.push(element.value);
		});
		provider.push('happy')
		provider.push('birthday')
		provider.push('dear')
		provider.push('sleepy')
		provider.push('joe')
		provider.push('joe')
		provider.push('joe')
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
		this.store.dispatch(new UpdateAdvancedSearchParamAction({advancedSearchParameter: this.getCurrentAdvancedSearchParameters()}))
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
			providers: this.selectedProviders
		}
	}

	getAllDataInputFilter(): any[] {
		const dataInputs = Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
			.map(([providerName, { dataInputFiltersConfig, showOnlyMyChildren }]: [string, IOverlaysSourceProvider]) => {
				if (showOnlyMyChildren) {
				return dataInputFiltersConfig.children.map(child => {
					return this.buildDataFilter(providerName, child);
				});
				} else {
					return {
						...dataInputFiltersConfig,
						children: dataInputFiltersConfig.children.map(child => this.buildDataFilter(providerName, child))
					};
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

	getAllSensorsTypes() {
		return flattenDeep(this.dataFilters.map(filter => this.selectAllChildren(filter)));
	}

	ngOnInit(): void {
		this.allProviders = this.statusBarConfig.defaultAdvancedSearchParameters.providers;
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
		});
		return types;
	}

	search() {
		this.store.dispatch(new UpdateAdvancedSearchParamAction({advancedSearchParameter: this.getCurrentAdvancedSearchParameters()}));
		this.store.dispatch(new SetOverlaysCriteriaAction(this.getCurrentAdvancedSearchParameters()));
		this._parent.close();
	}

	updateSelectedTypes(selectedTypesArray) {
		const changedType = this.getUniqueElement(selectedTypesArray, this.selectedTypes)[0];
		this.updateSelectedProvidersByType(changedType);
		this.selectedTypes = selectedTypesArray;
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
