import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp,
	SetOverlaysCriteriaAction,
	SetOverlaysStatusMessage,
	UpdateOverlaysCountAction
} from '../actions/overlays.actions';
import { IOverlay, IOverlaysCriteria, IOverlaysFetchData, RegionContainment } from '../models/overlay.model';
import { BackToWorldView } from '../overlay-status/actions/overlay-status.actions';
import { selectFavoriteOverlays, selectPresetOverlays } from '../overlay-status/reducers/overlay-status.reducer';
import {
	MarkUpClass,
	overlaysStateSelector,
	overlaysStatusMessages,
	selectDrops,
	selectOverlaysArray,
	selectOverlaysCriteria
} from '../reducers/overlays.reducer';
import { OverlaysService } from '../services/overlays.service';
import { rxPreventCrash } from '../../core/utils/rxjs/operators/rxPreventCrash';
import { getPolygonIntersectionRatio, isPointContainedInGeometry } from '@ansyn/imagery';
import { getErrorLogFromException } from '../../core/utils/logs/timer-logs';
import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class OverlaysEffects {

	@Effect({ dispatch: false })
	setOverlaysContainedInRegionField$ = this.actions$.pipe(
		ofType(OverlaysActionTypes.SET_OVERLAYS_CRITERIA, OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		withLatestFrom(this.store$.select(selectOverlaysCriteria), this.store$.select(selectOverlaysArray)),
		filter(([action, criteria, overlays]: [any, IOverlaysCriteria, IOverlay[]]) => Boolean(overlays) && overlays.length > 0),
		tap(([action, criteria, overlays]: [any, IOverlaysCriteria, IOverlay[]]) => {
			overlays.forEach((overlay: IOverlay) => {
				try {
					if (criteria.region.type === 'Point') {
						const isContained = isPointContainedInGeometry(criteria.region, overlay.footprint);
						overlay.containedInSearchPolygon = isContained ? RegionContainment.contained : RegionContainment.notContained;
					} else {
						const ratio = getPolygonIntersectionRatio(criteria.region, overlay.footprint);
						if (!Boolean(ratio)) {
							overlay.containedInSearchPolygon = RegionContainment.notContained;
						} else if (ratio === 1) {
							overlay.containedInSearchPolygon = RegionContainment.contained;
						} else {
							overlay.containedInSearchPolygon = RegionContainment.intersect;
						}
					}
				} catch (e) {
					console.error('failed to calc overlay intersection ratio of ', overlay, ' error ', e);
					overlay.containedInSearchPolygon = RegionContainment.unknown;
				}
			});
		}),
		rxPreventCrash()
	);

	setOverlaysCriteria$ = createEffect(() => this.actions$.pipe(
		ofType(SetOverlaysCriteriaAction),
		filter(action => !(action.options && action.options.noInitialSearch)),
		withLatestFrom(this.store$.select(overlaysStateSelector)),
		map(([{ payload }, { overlaysCriteria }]) => LoadOverlaysAction(overlaysCriteria)))
	);

	loadOverlays$ = createEffect(() => this.actions$.pipe(
		ofType(LoadOverlaysAction),
		switchMap(payload => {
			return this.overlaysService.search(payload).pipe(
				withLatestFrom(this.translate.get(overlaysStatusMessages.noOverLayMatchQuery), this.translate.get(overlaysStatusMessages.overLoad), this.translate.get('Error on overlays request')),
				mergeMap(([overlays, noOverlayMatchQuery, overLoad, error]: [IOverlaysFetchData, string, string, string]) => {
					const overlaysResult = Array.isArray(overlays.data) ? overlays.data : [];

					if (!Array.isArray(overlays.data) && Array.isArray(overlays.errors) && overlays.errors.length >= 0) {
						return [LoadOverlaysSuccessAction({payload: overlaysResult}),
							SetOverlaysStatusMessage({payload: error})];
					}

					const actions: Array<any> = [LoadOverlaysSuccessAction({payload: overlaysResult})];

					// if data.length != fetchLimit that means only duplicate overlays removed
					if (!overlays.data || overlays.data.length === 0) {
						actions.push(SetOverlaysStatusMessage({payload: noOverlayMatchQuery}));
					} else if (overlays.limited > 0 && overlays.data.length === this.overlaysService.fetchLimit) {
						// TODO: replace when design is available
						actions.push(SetOverlaysStatusMessage({payload: overLoad.replace('$overLoad', overlays.data.length.toString())}));
					}
					return actions;
				}),
				catchError(() => from([LoadOverlaysSuccessAction({payload: []}), new SetOverlaysStatusMessage('Error on overlays request')]))
			);
		}))
	);

	onRequestOverlayByID$ = createEffect(() => this.actions$.pipe(
		ofType(RequestOverlayByIDFromBackendAction),
		mergeMap((payload) => {
			return this.overlaysService.getOverlayById(payload.overlayId, payload.sourceType).pipe(
				map((overlay: IOverlay) => DisplayOverlayAction({
					overlay,
					mapId: payload.mapId,
					forceFirstDisplay: true
				})),
				catchError((exception) => {
					const errMsg = getErrorLogFromException(exception, `Failed to get overlay id=${action.payload.overlayId} sourceType=${action.payload.sourceType}`);
					this.loggerService.error(errMsg, 'overlays', 'Overlay_By_ID');
					return from([
						DisplayOverlayFailedAction({ id: payload.overlayId, mapId: payload.mapId }),
						BackToWorldView({ mapId: payload.mapId })
					]);
				})
			);
		}))
	);

	setFavoriteOverlaysUpdateCase$ = createEffect(() => this.store$.pipe(
		select(selectFavoriteOverlays),
		map((favoriteOverlays: IOverlay[]) => favoriteOverlays.map(overlay => overlay.id)),
		map((overlayIds) => SetMarkUp({
				classToSet: MarkUpClass.favorites,
				dataToSet: {
					overlaysIds: overlayIds
				}
			}
		)))
	);

	setPresetOverlaysUpdateCase$ = createEffect(() => this.store$.pipe(
		select(selectPresetOverlays),
		map((presetOverlays: IOverlay[]) => presetOverlays.map(overlay => overlay.id)),
		map((overlayIds) => SetMarkUp({
				classToSet: MarkUpClass.presets,
				dataToSet: {
					overlaysIds: overlayIds
				}
			}
		)))
	);

	dropsCount$ = createEffect(() => this.store$.select(selectDrops).pipe(
		filter(Boolean),
		map<any, any>(drops => UpdateOverlaysCountAction(drops.length)))
	);

	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected translate: TranslateService,
				protected overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}


}
