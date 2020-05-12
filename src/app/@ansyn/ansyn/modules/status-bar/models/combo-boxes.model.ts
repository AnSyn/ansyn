import { CaseGeoFilter, CaseTimeFilter } from '../../menu-items/cases/models/case.model';
import { InjectionToken } from '@angular/core';

export const timeFilters: CaseTimeFilter[] = ['Start - End'];
export const geoFilters: CaseGeoFilter[] = <any>Object.values(CaseGeoFilter);


export const GEO_FILTERS = new InjectionToken<CaseGeoFilter[]>('GEO_FILTERS');
export const TIME_FILTERS = new InjectionToken<CaseTimeFilter[]>('TIME_FILTERS');


export interface IComboBoxesOptions {
	timeFilters: CaseTimeFilter[];
	geoFilters: CaseGeoFilter[];
}

export const comboBoxesOptions: IComboBoxesOptions = { timeFilters, geoFilters };
