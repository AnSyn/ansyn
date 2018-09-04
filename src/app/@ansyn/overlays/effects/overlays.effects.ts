import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import {
	DisplayOverlayAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp,
	SetOverlaysStatusMessage
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { Store, select } from '@ngrx/store';
import { IOverlaysState, MarkUpClass, overlaysStatusMessages, selectDrops } from '../reducers/overlays.reducer';
import { IOverlay } from '../models/overlay.model';
import { unionBy } from 'lodash';
import 'rxjs/add/operator/share';
import { IOverlaysFetchData } from '@ansyn/core/models/overlay.model';
import {
	coreStateSelector,
	ICoreState,
	selectFavoriteOverlays,
	selectPresetOverlays
} from '@ansyn/core/reducers/core.reducer';
import { UpdateOverlaysCountAction } from '@ansyn/core/actions/core.actions';
import { map } from 'rxjs/operators';

@Injectable()
export class OverlaysEffects {


	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.withLatestFrom(this.store$.select(coreStateSelector))
		.mergeMap(([action, { favoriteOverlays }]: [LoadOverlaysAction, ICoreState]) => {
			return this.overlaysService.search(action.payload)
				.mergeMap((overlays: IOverlaysFetchData) => {
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
				})
				.catch(() => Observable.from([new LoadOverlaysSuccessAction([]), new SetOverlaysStatusMessage('Error on overlays request')]));
		});

	@Effect()
	onRequestOverlayByID$: Observable<DisplayOverlayAction> = this.actions$
		.ofType<RequestOverlayByIDFromBackendAction>(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND)
		.flatMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId, action.payload.sourceType) // this.overlaysService.fetchData("",action.payload)
				.map((overlay: IOverlay) => new DisplayOverlayAction({
					overlay,
					mapId: action.payload.mapId,
					forceFirstDisplay: true
				}));
		});


	@Effect()
	setFavoriteOverlaysUpdateCase$: Observable<any> = this.store$.pipe(
		select(selectFavoriteOverlays),
		map((favoriteOverlays: IOverlay[]) => favoriteOverlays.map(overlay => overlay.id)),
		map((overlayIds) => new SetMarkUp({
				classToSet: MarkUpClass.favorites,
				dataToSet: {
					overlaysIds: overlayIds
				}
			}
		))
	);

	@Effect()
	setPresetOverlaysUpdateCase$: Observable<any> = this.store$.pipe(
		select(selectPresetOverlays),
		map((presetOverlays: IOverlay[]) => presetOverlays.map(overlay => overlay.id)),
		map((overlayIds) => new SetMarkUp({
				classToSet: MarkUpClass.presets,
				dataToSet: {
					overlaysIds: overlayIds
				}
			}
		))
	);

	@Effect()
	dropsCount$ = this.store$.select(selectDrops)
		.filter(Boolean)
		.map(drops => new UpdateOverlaysCountAction(drops.length));


	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected overlaysService: OverlaysService) {
	}


}
