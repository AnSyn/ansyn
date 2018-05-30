import { CaseFacetsState, CaseRegionState, CaseTimeState } from './case.model';
import { Entity } from '@ansyn/core/services/storage/storage.service';

export interface Context extends Entity{
	id: string;
	name: string;
	creationTime: Date;

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
