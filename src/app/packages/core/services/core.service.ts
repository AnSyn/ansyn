import { Injectable } from '@angular/core';
import { CaseMapState } from '../models/case.model';
import { isEmpty } from 'lodash';

@Injectable()
export class CoreService {
	static getOverlaysMarkup(mapsList: CaseMapState[], activeMapId: string, favoriteOverlays: string[], hoverId?: string) {
		const result = [];

		mapsList.forEach((map: CaseMapState) => {
			if (!isEmpty(map.data.overlay)) {
				if (map.id === activeMapId) {
					result.push({ id: map.data.overlay.id, class: 'active' });
				} else {
					result.push({ id: map.data.overlay.id, class: 'displayed' });
				}
			}
		});

		if (favoriteOverlays) {
			favoriteOverlays.forEach(item => result.push({ id: item, class: 'favorites' }));
		}

		if (hoverId) {
			result.push({ id: hoverId, class: 'hover' });
		}

		return result;
	}
}
