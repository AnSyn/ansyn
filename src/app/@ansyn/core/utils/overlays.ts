import { IOverlay } from '../models/overlay.model';
import { IFilterModel } from '../models/IFilterModel';
import { union } from 'lodash';

export function isFullOverlay(overlay: IOverlay): boolean {
	return Boolean(overlay && overlay.date);
}

// export function buildFilteredOverlays(overlays: IOverlay[], parsedFilters: IFilterModel[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean): string[] {
// 	let parsedOverlays: IOverlay[] = [];
//
// 	const filteredOverlays = overlays.filter((overlay) => parsedFilters.every(filter => filter.filterFunc(overlay, filter.key)));
// 	parsedOverlays = [...parsedOverlays, ...filteredOverlays];
//
// 	if (removedOverlaysVisibility) {
// 		parsedOverlays = parsedOverlays.filter((overlay) => !removedOverlaysIds.some((overlayId) => overlay.id === overlayId));
// 	}
// 	return union(parsedOverlays.map(({ id }) => id));
// }
