import { CaseDataInputFilter, CaseGeoFilter, CaseOrientation, CaseTimeFilter } from '@ansyn/core/models/case.model';
import { InjectionToken } from '@angular/core';

export const timeFilters: CaseTimeFilter[] = ['Start - End'];
export const dataInputFilters: CaseDataInputFilter[] = ['Data Input Filter'];
export const geoFilters: CaseGeoFilter[] = <any>Object.values(CaseGeoFilter);
export const orientations: CaseOrientation[] = ['Align North', 'User Perspective', 'Imagery Perspective'];

export const ORIENTATIONS = new InjectionToken<CaseOrientation[]>('ORIENTATIONS');
export const GEO_FILTERS = new InjectionToken<CaseGeoFilter[]>('GEO_FILTERS');
export const DATA_INPUT_FILTERS = new InjectionToken<CaseDataInputFilter[]>('DATA_INPUT_FILTERS');
export const TIME_FILTERS = new InjectionToken<CaseTimeFilter[]>('TIME_FILTERS');


export interface ComboBoxesOptions {
	dataInputFilters: CaseDataInputFilter[];
	timeFilters: CaseTimeFilter[];
	orientations: CaseOrientation[];
	geoFilters: CaseGeoFilter[];
}

export const comboBoxesOptions: ComboBoxesOptions = { dataInputFilters, timeFilters, orientations, geoFilters };

export interface ComboBoxesProperties {
	orientation?: CaseOrientation;
	geoFilter?: CaseGeoFilter;
	dataInputFilter?: CaseDataInputFilter;
	timeFilter?: CaseTimeFilter;
}
