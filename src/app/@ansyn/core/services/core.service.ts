import { Injectable } from '@angular/core';
import { CaseMapState } from '../models/case.model';
import { Overlay } from '../index';

@Injectable()
export class CoreService {
	static getOverlaysMarkup(mapsList: CaseMapState[], activeMapId: string, favoriteOverlays: Overlay[], hoverId?: string) {
		const result = [];

		mapsList.forEach((map: CaseMapState) => {
			if (Boolean(map.data.overlay)) {
				if (map.id === activeMapId) {
					result.push({ id: map.data.overlay.id, class: 'active' });
				} else {
					result.push({ id: map.data.overlay.id, class: 'displayed' });
				}
			}
		});

		if (favoriteOverlays) {
			favoriteOverlays.forEach((item: Overlay) => result.push({ id: item.id, class: 'favorites' }));
		}

		if (hoverId) {
			result.push({ id: hoverId, class: 'hover' });
		}

		return result;
	}
}
