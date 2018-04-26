import { InjectionToken } from '@angular/core';
import { CaseGeoFilter, CaseOrientation, CaseTimeFilter } from '@ansyn/core/models/case.model';

export const timeFilters: CaseTimeFilter[] = ['Start - End'];
export const geoFilters: CaseGeoFilter[] = Object.values(CaseGeoFilter);
export const orientations: CaseOrientation[] = ['Align North', 'User Perspective', 'Imagery Perspective'];

export const ORIENTATIONS = new InjectionToken<CaseOrientation[]>('ORIENTATIONS');
export const GEO_FILTERS = new InjectionToken<CaseGeoFilter[]>('GEO_FILTERS');
export const TIME_FILTERS = new InjectionToken<CaseTimeFilter[]>('TIME_FILTERS');

export interface ComboBoxesOptions {
	timeFilters: CaseTimeFilter[];
	orientations: CaseOrientation[];
	geoFilters: CaseGeoFilter[];
}

export const comboBoxesOptions: ComboBoxesOptions = { timeFilters, orientations, geoFilters };

export interface ComboBoxesProperties {
	orientation?: CaseOrientation;
	geoFilter?: CaseGeoFilter;
	timeFilter?: CaseTimeFilter;
}
