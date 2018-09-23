import { CaseGeoFilter, CaseOrientation, CaseTimeFilter } from '@ansyn/core';
import { InjectionToken } from '@angular/core';

export const timeFilters: CaseTimeFilter[] = ['Start - End'];
export const geoFilters: CaseGeoFilter[] = <any>Object.values(CaseGeoFilter);
export const orientations: CaseOrientation[] = ['Align North', 'User Perspective', 'Imagery Perspective'];

export const ORIENTATIONS = new InjectionToken<CaseOrientation[]>('ORIENTATIONS');
export const GEO_FILTERS = new InjectionToken<CaseGeoFilter[]>('GEO_FILTERS');
export const TIME_FILTERS = new InjectionToken<CaseTimeFilter[]>('TIME_FILTERS');


export interface IComboBoxesOptions {
	timeFilters: CaseTimeFilter[];
	orientations: CaseOrientation[];
	geoFilters: CaseGeoFilter[];
}

export const comboBoxesOptions: IComboBoxesOptions = { timeFilters, orientations, geoFilters };

export interface IComboBoxesProperties {
	orientation?: CaseOrientation;
	timeFilter?: CaseTimeFilter;
}
