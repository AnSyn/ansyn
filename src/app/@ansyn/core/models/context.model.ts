import { CaseFacetsState, CaseRegionState, CaseTimeState } from './case.model';

export interface Context {
	id: string;
	name: string;

	/* optionals */
	layoutIndex?: number;
	zoom?: number;
	imageryCountBefore?: number;
	imageryCountAfter?: number;
	timeFilter?: string;
	geoFilter?: string;
	orientation?: string;
	time?: CaseTimeState;
	facets?: CaseFacetsState;
	region?: CaseRegionState;
	requires?: string[]
	defaultOverlay?: string;
	requirements?: string[];
}
