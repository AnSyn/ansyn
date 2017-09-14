import { Actions, Effect, toPayload } from '@ngrx/effects';
import {
	ContextMenuShowAction,
	MapActionTypes,
	SetContextMenuFiltersAction
} from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { get as _get } from 'lodash';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';
import { inside } from '@turf/turf';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';

@Injectable()
export class ContextMenuAppEffects {

	@Effect()
	setContextFilter$: Observable<SetContextMenuFiltersAction> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.SHOW)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('map'))
		.map(([action, overlays, mapState]: [ContextMenuShowAction, IOverlayState, IMapState]) => {
			let filteredOverlays: any[] = OverlaysService.pluck(overlays.overlays, overlays.filteredOverlays, ['id', 'footprint', 'sensorName', 'date', 'bestResolution']);
			filteredOverlays = filteredOverlays.filter(({ footprint }) => inside(action.payload.point, footprint));
			const activeMap = MapFacadeService.activeMap(mapState);
			return new SetContextMenuFiltersAction({
				filteredOverlays,
				displayedOverlay: <any>_get(activeMap.data, 'overlay')
			});
		});

	@Effect()
	onContextMenuDisplayAction$: Observable<any> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.DISPLAY)
		.map(toPayload)
		.map(id => new DisplayOverlayFromStoreAction({ id }));

	constructor(private actions$: Actions,
				private store$: Store<IAppState>) {
	}

}
