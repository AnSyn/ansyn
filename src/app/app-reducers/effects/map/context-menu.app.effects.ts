import { Actions, Effect } from '@ngrx/effects';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { IOverlayState } from '../../../packages/overlays/reducers/overlays.reducer';
import { OverlaysService } from '../../../packages/overlays/services/overlays.service';
import { ICasesState } from '../../../packages/menu-items/cases/reducers/cases.reducer';
import { DisplayOverlayAction } from '../../../packages/overlays/actions/overlays.actions';

@Injectable()
export class ContextMenuAppEffects {

	constructor(
		private actions$: Actions,
		private store$: Store<IAppState>,
		private  overlaysService: OverlaysService
	){}

	@Effect()
	$clickNext: Observable<any> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU_NEXT)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action, overlays: IOverlayState, cases: ICasesState): any[] => {
			let overlaysData = [];
			const activeMap = cases.selected_case.state.maps.data.find(map => map.id === cases.selected_case.state.maps.active_map_id);
			const currentOverlayId = activeMap.data.overlay.id;

			overlays.overlays.forEach(overlay => {
				if (overlays.filters.every(filter => filter.filterFunc(overlay, filter.filteringParams))) {
					overlaysData.push(overlay);
				}
			});
			overlaysData = this.overlaysService.setSortedDropsMap(overlaysData);
			const currentIndex = overlaysData.findIndex(o => o.id === currentOverlayId);
			return [overlaysData, currentIndex];
		})
		.map(([overlaysData, currentIndex]: [any, number] )=> {
			console.log({currentIndex});
			const nextOverlay = overlaysData[currentIndex + 1];
			return new DisplayOverlayAction({overlay: nextOverlay});
		})
}
