import { IFilterModel } from '../models/IFilterModel';
import { union } from 'lodash';
import { IOverlay } from '../../overlays/models/overlay.model';

export function isFullOverlay(overlay: IOverlay): boolean {
	return Boolean(overlay && overlay.date);
}

export function buildFilteredOverlays(overlays: IOverlay[], parsedFilters: IFilterModel[]) {
	let parsedOverlays: IOverlay[] = [];

	const filteredOverlays = overlays.filter((overlay) => parsedFilters.every(filter => filter.filterFunc(overlay, filter.key)));
	parsedOverlays = [...parsedOverlays, ...filteredOverlays];
	
	return union(parsedOverlays.map(({ id }) => id));
}
