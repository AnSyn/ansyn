import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { from, Observable } from 'rxjs';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp,
	SetOverlaysStatusMessage
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { select, Store } from '@ngrx/store';
import { MarkUpClass, overlaysStatusMessages, selectDrops } from '../reducers/overlays.reducer';
import {
	BackToWorldView,
	IOverlay,
	IOverlaysFetchData,
	LoggerService,
	selectFavoriteOverlays,
	selectPresetOverlays,
	UpdateOverlaysCountAction
} from '@ansyn/core';
import { catchError, filter, map, mergeMap, switchMap } from 'rxjs/operators';

@Injectable()
export class OverlaysEffects {


	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		switchMap((action: LoadOverlaysAction) => {
			return this.overlaysService.search(action.payload).pipe(
				mergeMap((overlays: IOverlaysFetchData) => {
					const overlaysResult = Array.isArray(overlays.data) ? overlays.data : [];

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
				}),
				catchError(() => from([new LoadOverlaysSuccessAction([]), new SetOverlaysStatusMessage('Error on overlays request')]))
			)
		})
	);

	@Effect()
	onRequestOverlayByID$: Observable<any> = this.actions$.pipe(
		ofType<RequestOverlayByIDFromBackendAction>(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND),
		mergeMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId, action.payload.sourceType).pipe(
				map((overlay: IOverlay) => new DisplayOverlayAction({
					overlay,
					mapId: action.payload.mapId,
					forceFirstDisplay: true
				})),
				catchError((exception) => {
					this.loggerService.error(exception);
					console.error(exception);
					return from([
						new DisplayOverlayFailedAction({ id: action.payload.overlayId, mapId: action.payload.mapId }),
						new BackToWorldView({ mapId: action.payload.mapId })
					]);
				})
			);
		})
	);


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
	dropsCount$ = this.store$.select(selectDrops).pipe(
		filter(Boolean),
		map(drops => new UpdateOverlaysCountAction(drops.length)));


	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}


}
