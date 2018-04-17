import { CaseMapState } from '@ansyn/core/models/case.model';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';

export interface IMapState {
	activeMapId: string;
	mapsList: CaseMapState[];
	isLoadingMaps: Map<string, string>,
	pendingMapsCount: number; // number of maps to be opened
	pendingOverlays: string[]; // a list of overlays waiting for maps to be created in order to be displayed
}

export const mapFeatureKey = 'map';

export const mapStateSelector: MemoizedSelector<any, IMapState> = createFeatureSelector<IMapState>(mapFeatureKey);
