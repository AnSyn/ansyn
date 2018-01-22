import { CaseGeoFilter, CaseOrientation, CaseTimeFilter } from '@ansyn/core';

export const timeFilters: CaseTimeFilter[] = ['Start - End'];
export const geoFilters: CaseGeoFilter[] = ['Pin-Point'];
export const orientations: CaseOrientation[] = ['Align North', 'User Perspective', 'Imagery Perspective'];

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
