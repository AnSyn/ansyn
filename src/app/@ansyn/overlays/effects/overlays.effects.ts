import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayAction, LoadOverlaysAction, LoadOverlaysSuccessAction, OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { Action, Store } from '@ngrx/store';
import { IOverlaysState, overlaysStateSelector, overlaysStatusMessages } from '../reducers/overlays.reducer';
import { Overlay } from '../models/overlay.model';
import { unionBy } from 'lodash';
import 'rxjs/add/operator/share';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { SetOverlaysStatusMessage } from '@ansyn/overlays/actions/overlays.actions';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { UpdateOverlaysCountAction } from '@ansyn/core/actions/core.actions';

@Injectable()
export class OverlaysEffects {


	/**
	 * @type Effect
	 * @name loadOverlays$
	 * @ofType LoadOverlaysAction
	 * @action LoadOverlaysSuccessAction
	 */
	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.withLatestFrom(this.store$.select(coreStateSelector))
		.mergeMap(([action, { favoriteOverlays }]: [LoadOverlaysAction, ICoreState]) => {
			return this.overlaysService.search(action.payload)
				.mergeMap((overlays: OverlaysFetchData) => {
					const overlaysResult = unionBy(Array.isArray(overlays.data) ? overlays.data : [],
						favoriteOverlays, o => o.id);

					if (!Array.isArray(overlays.data) && Array.isArray(overlays.errors) && overlays.errors.length >= 0) {
						return [new LoadOverlaysSuccessAction(overlaysResult ),
							new SetOverlaysStatusMessage('Error on overlays request')];
					}

					const actions: Array<any> = [new LoadOverlaysSuccessAction( overlaysResult )];

					// if data.length != fetchLimit that means only duplicate overlays removed
					if (!overlays.data || overlays.data.length === 0) {
						actions.push(new SetOverlaysStatusMessage(overlaysStatusMessages.noOverLayMatchQuery));
					} else if (overlays.limited > 0 && overlays.data.length === this.overlaysService.fetchLimit) {
						// TODO: replace when design is available
						actions.push(new SetOverlaysStatusMessage(overlaysStatusMessages.overLoad.replace('$overLoad', overlays.data.length.toString())));
					}
					return actions;
				})
				.catch(() => Observable.from([new LoadOverlaysSuccessAction([] ), new SetOverlaysStatusMessage('Error on overlays request')]));
		});

	/**
	 * @type Effect
	 * @name onRequestOverlayByID$
	 * @ofType RequestOverlayByIDFromBackendAction
	 * @action DisplayOverlayAction
	 */
	@Effect()
	onRequestOverlayByID$: Observable<DisplayOverlayAction> = this.actions$
		.ofType<RequestOverlayByIDFromBackendAction>(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND)
		.flatMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId, action.payload.sourceType) // this.overlaysService.fetchData("",action.payload)
				.map((overlay: Overlay) => new DisplayOverlayAction({
					overlay,
					mapId: action.payload.mapId,
					forceFirstDisplay: true
				}));
		});

	/**
	 * @type Effect
	 * @name drops$
	 * @description this method parse overlays for display ( drops )
	 * @ofType LoadOverlaysAction, LoadOverlaysSuccessAction, SetFilteredOverlaysAction, SetSpecialObjectsActionStore
	 * @dependencies overlays
	 */

	@Effect({ dispatch: false })
	drops$: Observable<any[]> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS,
			OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS,
			OverlaysActionTypes.SET_FILTERED_OVERLAYS,
			OverlaysActionTypes.SET_SPECIAL_OBJECTS)
		.withLatestFrom(this.store$.select(overlaysStateSelector))
		.map(([action, overlays]: [Action, IOverlaysState]) => {
			return OverlaysService.parseOverlayDataForDisplay(overlays);
		});

	@Effect()
	dropsCount$: Observable<UpdateOverlaysCountAction> = this.drops$
		.filter(Boolean)
		.map(drops => new UpdateOverlaysCountAction(drops[0].data.length));


	constructor(protected actions$: Actions,
				protected store$: Store<IOverlaysState>,
				protected overlaysService: OverlaysService) {
	}


}
