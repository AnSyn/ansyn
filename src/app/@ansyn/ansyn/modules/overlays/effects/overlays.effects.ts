import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable, EMPTY } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { LoggerService } from '../../core/services/logger.service';
import { UpdateOverlaysCountAction } from '../../overlays/actions/overlays.actions';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp,
	SetOverlaysCriteriaAction,
	SetOverlaysStatusMessage
} from '../actions/overlays.actions';
import { IOverlay, IOverlaysFetchData, IOverlaysCriteria, RegionContainment } from '../models/overlay.model';
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
import { getPolygonIntersectionRatioWithMultiPolygon, isPointContainedInMultiPolygon } from '@ansyn/imagery';

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
						const isContained = isPointContainedInMultiPolygon(criteria.region, overlay.footprint);
						overlay.containedInSearchPolygon = isContained ? RegionContainment.contained : RegionContainment.notContained;
					} else {
						const ratio = getPolygonIntersectionRatioWithMultiPolygon(criteria.region, overlay.footprint);
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

	@Effect()
	setOverlaysCriteria$ = this.actions$.pipe(
		ofType<SetOverlaysCriteriaAction>(OverlaysActionTypes.SET_OVERLAYS_CRITERIA),
		filter(action => !(action.options && action.options.noInitialSearch)),
		withLatestFrom(this.store$.select(overlaysStateSelector)),
		map(([{ payload }, { overlaysCriteria }]) => new LoadOverlaysAction(overlaysCriteria)));

	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		switchMap((action: LoadOverlaysAction) => {
			return this.overlaysService.search(action.payload).pipe(
				withLatestFrom(this.translate.get(overlaysStatusMessages.noOverLayMatchQuery), this.translate.get(overlaysStatusMessages.overLoad), this.translate.get('Error on overlays request')),
				mergeMap(([overlays, noOverlayMatchQuery, overLoad, error]: [IOverlaysFetchData, string, string, string]) => {
					const overlaysResult = Array.isArray(overlays.data) ? overlays.data : [];

					if (!Array.isArray(overlays.data) && Array.isArray(overlays.errors) && overlays.errors.length >= 0) {
						return [new LoadOverlaysSuccessAction(overlaysResult),
							new SetOverlaysStatusMessage(error)];
					}

					const actions: Array<any> = [new LoadOverlaysSuccessAction(overlaysResult)];

					// if data.length != fetchLimit that means only duplicate overlays removed
					if (!overlays.data || overlays.data.length === 0) {
						actions.push(new SetOverlaysStatusMessage(noOverlayMatchQuery));
					} else if (overlays.limited > 0 && overlays.data.length === this.overlaysService.fetchLimit) {
						// TODO: replace when design is available
						actions.push(new SetOverlaysStatusMessage(overLoad.replace('$overLoad', overlays.data.length.toString())));
					}
					return actions;
				}),
				catchError(() => from([new LoadOverlaysSuccessAction([]), new SetOverlaysStatusMessage('Error on overlays request')]))
			);
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
				protected translate: TranslateService,
				protected overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}


}
