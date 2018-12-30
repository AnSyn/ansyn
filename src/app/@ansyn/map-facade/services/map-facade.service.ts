import { Injectable } from '@angular/core';
import { IMapState } from '../reducers/map.reducer';
import { getFootprintIntersectionRatioInExtent, ICaseMapState, IOverlay } from '@ansyn/core';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class MapFacadeService {
	static isNotIntersect(extentPolygon, footprint, overlayCoverage): boolean {
		const intersection = getFootprintIntersectionRatioInExtent(extentPolygon, footprint);
		return intersection < overlayCoverage;
	}

	static isOverlayGeoRegistered(overlay: IOverlay): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered;
	}

	static activeMap(mapState: IMapState): ICaseMapState {
		return mapState.entities[mapState.activeMapId];
	}

	static mapById(mapsList: ICaseMapState[], mapId: string): ICaseMapState {
		return mapsList.find(({ id }: ICaseMapState) => {
			return id === mapId;
		});
	}

}
