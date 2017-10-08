import { Actions, Effect, toPayload } from '@ngrx/effects';
import {
	ContextMenuGetFilteredOverlaysAction,
	ContextMenuShowAction,
	MapActionTypes
} from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';
import { inside } from '@turf/turf';
import { Overlay } from '@ansyn/core/models/overlay.model';

@Injectable()
export class ContextMenuAppEffects {

	/**
	 * @type Effect
	 * @name setContextFilter$
	 * @ofType ContextMenuShowAction
	 * @dependencies overlays
	 * @action ContextMenuGetFilteredOverlaysAction
	 */
	@Effect()
	setContextFilter$: Observable<ContextMenuGetFilteredOverlaysAction> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.SHOW)
		.withLatestFrom(this.store$.select('overlays'))
		.map(([action, overlaysState]: [ContextMenuShowAction, IOverlayState]) => {
			return overlaysState.filteredOverlays
				.map((id: string): Overlay => overlaysState.overlays.get(id))
				.filter(({ footprint }) => inside(action.payload.point, footprint));
		})
		.map((filteredOverlays: Overlay[]) => new ContextMenuGetFilteredOverlaysAction(filteredOverlays));

	/**
	 * @type Effect
	 * @name onContextMenuDisplayAction$
	 * @ofType ContextMenuDisplayAction
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	onContextMenuDisplayAction$: Observable<any> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.DISPLAY)
		.map(toPayload)
		.map(id => new DisplayOverlayFromStoreAction({ id }));

	constructor(private actions$: Actions,
				private store$: Store<IAppState>) {
	}

}
