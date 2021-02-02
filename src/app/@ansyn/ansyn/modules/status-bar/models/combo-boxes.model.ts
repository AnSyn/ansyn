import { CaseGeoFilter, CaseTimeFilter } from '../../menu-items/cases/models/case.model';
import { InjectionToken } from '@angular/core';

export const geoFilters: CaseGeoFilter[] = <any>Object.values(CaseGeoFilter);


export const GEO_FILTERS = new InjectionToken<CaseGeoFilter[]>('GEO_FILTERS');


export interface IComboBoxesOptions {
	geoFilters: CaseGeoFilter[];
}

export const comboBoxesOptions: IComboBoxesOptions = { geoFilters };
