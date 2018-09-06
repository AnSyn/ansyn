import { IOverlay } from '../models/overlay.model';
import { IFilterModel } from '../models/IFilterModel';
import { sortByDateDesc } from './sorting';
import { union } from 'lodash';

export function isFullOverlay(overlay: IOverlay): boolean {
	return Boolean(overlay && overlay.date);
}

export function buildFilteredOverlays(overlays: IOverlay[], parsedFilters: IFilterModel[], favorites: IOverlay[], showOnlyFavorite: boolean, removedOverlaysIds: string[], removedOverlaysVisibility: boolean): string[] {
	let parsedOverlays: IOverlay[] = favorites;
	if (!showOnlyFavorite) {
		const filteredOverlays = overlays.filter((overlay) => parsedFilters.every(filter => filter.filterFunc(overlay, filter.key)));
		parsedOverlays = [...parsedOverlays, ...filteredOverlays];
	}

	if (removedOverlaysVisibility) {
		parsedOverlays = parsedOverlays.filter((overlay) => !removedOverlaysIds.some((overlayId) => overlay.id === overlayId));
	}
	parsedOverlays.sort(sortByDateDesc);
	return union(parsedOverlays.map(({ id }) => id));
}
