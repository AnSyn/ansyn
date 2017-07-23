import { CaseTimeState, CaseFacetsState, CaseRegionState } from './case.model';

export type Context = {
	id: string;
	name: string;
	
	/* optionals */
	layout_index?: number;
	zoom?: number;
	imageryCount?: number;
	timeFilter?: string;
	geoFilter?: string;
	orientation?: string;
	time?: CaseTimeState;
	facets: CaseFacetsState;
	region?: CaseRegionState;
	requires?: string[]
}
