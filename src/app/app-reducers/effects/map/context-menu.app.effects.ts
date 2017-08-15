import { Actions, Effect, toPayload } from '@ngrx/effects';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { get as _get } from 'lodash';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { SetContextMenuFiltersAction, ContextMenuShowAction } from '@ansyn/map-facade/actions/map.actions';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { inside } from '@turf/turf';

@Injectable()
export class ContextMenuAppEffects {

	@Effect()
	setContextFilter$: Observable<SetContextMenuFiltersAction> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.SHOW)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'))
		.map(([action, overlays, cases]: [ContextMenuShowAction, IOverlayState, ICasesState]) => {
			let filteredOverlays: any[] = OverlaysService.pluck(overlays.overlays, overlays.filteredOverlays, ['id', 'footprint', 'sensorName', 'date', 'bestResolution']);
			filteredOverlays = filteredOverlays.filter(({footprint}) => inside(action.payload.point, footprint));
			const activeMap = CasesService.activeMap(cases.selected_case);
			return new SetContextMenuFiltersAction({filteredOverlays, displayedOverlay: <any>_get(activeMap.data, 'overlay')});
		});

	@Effect()
	onContextMenuDisplayAction$: Observable<any> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.DISPLAY)
		.map(toPayload)
		.map(id => {
			return new DisplayOverlayFromStoreAction({id});
		});

	constructor(
		private actions$: Actions,
		private store$: Store<IAppState>
	){}

}
