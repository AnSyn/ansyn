import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable, from } from 'rxjs';
import {
	DisplayOverlayAction, DisplayOverlayFailedAction,
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
import { IOverlay } from '../../models/overlay.model';
import { unionBy } from 'lodash';
import 'rxjs/add/operator/share';
import { IOverlaysFetchData } from '../../models/overlay.model';
import { coreStateSelector, ICoreState, selectFavoriteOverlays, selectPresetOverlays } from '../../reducers/core.reducer';
import { BackToWorldView, UpdateOverlaysCountAction } from '../../actions/core.actions';
import { map } from 'rxjs/operators';
import { LoggerService } from '../../services/logger.service';

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
				.catch(() => from([new LoadOverlaysSuccessAction([]), new SetOverlaysStatusMessage('Error on overlays request')]));
		});

	@Effect()
	onRequestOverlayByID$: Observable<any> = this.actions$
		.ofType<RequestOverlayByIDFromBackendAction>(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND)
		.flatMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId, action.payload.sourceType)
				.map((overlay: IOverlay) => new DisplayOverlayAction({
					overlay,
					mapId: action.payload.mapId,
					forceFirstDisplay: true
				}))
				.catch((exception) => {
					this.loggerService.error(exception);
					console.error(exception);
					return from([
						new DisplayOverlayFailedAction({id: action.payload.overlayId, mapId: action.payload.mapId}),
						new BackToWorldView({mapId: action.payload.mapId})
					])
				});
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
				protected overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}


}
