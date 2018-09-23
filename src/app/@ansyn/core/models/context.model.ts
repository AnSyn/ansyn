import { CaseRegionState, ICaseFacetsState, ICaseTimeState } from './case.model';
import { IEntity } from '../services/storage/storage.service';

export enum DisplayedOverlay {
	nearest = 'nearest',
	latest = 'latest',
}

export interface IContext extends IEntity {
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
	time?: ICaseTimeState;
	facets?: ICaseFacetsState;
	region?: CaseRegionState;
	requires?: string[]
	defaultOverlay?: DisplayedOverlay;
	requirements?: string[];
}
