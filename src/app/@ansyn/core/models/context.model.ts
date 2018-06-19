import { CaseFacetsState, CaseRegionState, CaseTimeState } from './case.model';
import { Entity } from '@ansyn/core/services/storage/storage.service';
import { DisplayedOverlay } from '@ansyn/context/reducers/context.reducer';

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
	orientation?: string;
	time?: CaseTimeState;
	facets?: CaseFacetsState;
	region?: CaseRegionState;
	requires?: string[]
	defaultOverlay?: DisplayedOverlay;
	requirements?: string[];
}
