import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { from, Observable } from 'rxjs';
import {
	DisplayOverlayAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetOverlaysStatusMessage
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { Store } from '@ngrx/store';
import { IOverlaysState, overlaysStatusMessages, selectDrops } from '../reducers/overlays.reducer';
import { IOverlay } from '../models/overlay.model';
import { unionBy } from 'lodash';
import { IOverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { UpdateOverlaysCountAction } from '@ansyn/core/actions/core.actions';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/internal/operators';

@Injectable()
export class OverlaysEffects {


	/**
	 * @type Effect
	 * @name loadOverlays$
	 * @ofType LoadOverlaysAction
	 * @action LoadOverlaysSuccessAction
	 */
	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$.pipe<any>(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		withLatestFrom(this.store$.select(coreStateSelector)),
		mergeMap(([action, { favoriteOverlays }]: [LoadOverlaysAction, ICoreState]) => {
			return this.overlaysService.search(action.payload).pipe(
				mergeMap((overlays: IOverlaysFetchData) => {
					const overlaysResult = unionBy(Array.isArray(overlays.data) ? overlays.data : [],
						favoriteOverlays, o => o.id);

					if (!Array.isArray(overlays.data) && Array.isArray(overlays.errors) && overlays.errors.length >= 0) {
						return [new LoadOverlaysSuccessAction(overlaysResult),
							new SetOverlaysStatusMessage('Error on overlays request')];
					}

					const actions: Array<any> = [new LoadOverlaysSuccessAction(overlaysResult)];

					// if data.length != fetchLimit that means only duplicate overlays removed
					if (!overlays.data || overlays.data.length === 0) {
						actions.push(new SetOverlaysStatusMessage(overlaysStatusMessages.noOverLayMatchQuery));
					} else if (overlays.limited > 0 && overlays.data.length === this.overlaysService.fetchLimit) {
						// TODO: replace when design is available
						actions.push(new SetOverlaysStatusMessage(overlaysStatusMessages.overLoad.replace('$overLoad', overlays.data.length.toString())));
					}
					return actions;
				})),
				catchError(() => from([new LoadOverlaysSuccessAction([]), new SetOverlaysStatusMessage('Error on overlays request')]));
		}));

	/**
	 * @type Effect
	 * @name onRequestOverlayByID$
	 * @ofType RequestOverlayByIDFromBackendAction
	 * @action DisplayOverlayAction
	 */
	@Effect()
	onRequestOverlayByID$: Observable<DisplayOverlayAction> = this.actions$.pipe(
		ofType<RequestOverlayByIDFromBackendAction>(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND),
		mergeMap((action: RequestOverlayByIDFromBackendAction): any => {
			return this.overlaysService.getOverlayById(action.payload.overlayId, action.payload.sourceType).pipe<any>(
				map((overlay: IOverlay): any => new DisplayOverlayAction({
					overlay,
					mapId: action.payload.mapId,
					forceFirstDisplay: true
				})));
		}));

	@Effect()
	dropsCount$ = this.store$.select(selectDrops).pipe(
		filter(Boolean),
		map(drops => new UpdateOverlaysCountAction(drops.length)));


	constructor(protected actions$: Actions,
				protected store$: Store<IOverlaysState>,
				protected overlaysService: OverlaysService) {
	}


}
