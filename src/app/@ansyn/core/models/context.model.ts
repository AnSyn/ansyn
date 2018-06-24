import { CaseFacetsState, CaseRegionState, CaseTimeState } from './case.model';
import { Entity } from '../services/storage/storage.service';

export enum DisplayedOverlay {
	nearest = 'nearest',
	latest = 'latest',
}

export interface Context extends Entity {
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
