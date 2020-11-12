import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, from, Observable } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
	CheckTrianglesAction,
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes, SetOverlaysContainmentChecked,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp,
	SetOverlaysCriteriaAction,
	SetOverlaysStatusMessageAction,
	UpdateOverlays,
	UpdateOverlaysCountAction
} from '../actions/overlays.actions';
import { IOverlay, IOverlaysCriteria, IOverlaysFetchData, RegionContainment } from '../models/overlay.model';
import { BackToWorldView } from '../overlay-status/actions/overlay-status.actions';
import { selectFavoriteOverlays } from '../overlay-status/reducers/overlay-status.reducer';
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
import { AreaToCredentialsService } from '../../core/services/credentials/area-to-credentials.service';
import { CredentialsService, ICredentialsResponse } from '../../core/services/credentials/credentials.service';
import { getMenuSessionData, SetBadgeAction } from '@ansyn/menu';
import { Update } from '@ngrx/entity';

@Injectable()
export class OverlaysEffects {

	@Effect()
	setOverlaysContainedInRegionField$ = this.actions$.pipe(
		ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		withLatestFrom(this.store$.select(selectOverlaysCriteria), this.store$.select(selectOverlaysArray)),
		filter(([action, criteria, overlays]: [any, IOverlaysCriteria, IOverlay[]]) => Boolean(overlays) && overlays.length > 0),
		mergeMap(([action, criteria, overlays]: [any, IOverlaysCriteria, IOverlay[]]) => {
			const payload: Update<IOverlay>[] = overlays.map((overlay: IOverlay) => {
				const region = criteria.region.geometry;
				let containedInSearchPolygon;
				try {
					if (region.type === 'Point') {
						const isContained = isPointContainedInGeometry(region, overlay.footprint);
						containedInSearchPolygon = isContained ? RegionContainment.contained : RegionContainment.notContained;
					} else {
						const ratio = getPolygonIntersectionRatio(region, overlay.footprint);
						if (!Boolean(ratio)) {
							containedInSearchPolygon = RegionContainment.notContained;
						} else if (ratio === 1) {
							containedInSearchPolygon = RegionContainment.contained;
						} else {
							containedInSearchPolygon = RegionContainment.intersect;
						}
					}
				} catch (e) {
					console.error('failed to calc overlay intersection ratio of ', overlay, ' error ', e);
					containedInSearchPolygon = RegionContainment.unknown;
				}
				return {
					id: overlay.id,
					changes: { containedInSearchPolygon }
				};
			});
			return [
				new UpdateOverlays(payload),
				new SetOverlaysContainmentChecked()
			];
		}),
		rxPreventCrash()
	);

	@Effect()
	setOverlaysCriteria$ = this.actions$.pipe(
		ofType<SetOverlaysCriteriaAction>(OverlaysActionTypes.SET_OVERLAYS_CRITERIA),
		filter(action => !(action.options && action.options.noInitialSearch)),
		withLatestFrom(this.store$.select(overlaysStateSelector)),
		map(([{ payload }, { overlaysCriteria }]) => new CheckTrianglesAction(overlaysCriteria)));

	userAuthorizedAreas$: Observable<any> = this.credentialsService.getCredentials().pipe(
		map((userCredentials: ICredentialsResponse) => userCredentials.authorizedAreas.map(
			area => area.Id
			)
		));

	@Effect()
	checkTrianglesBeforeSearch$ = this.actions$.pipe(
		ofType<CheckTrianglesAction>(OverlaysActionTypes.CHECK_TRIANGLES),
		switchMap((action: CheckTrianglesAction) => {
			const region = action.payload.region.geometry;
			const { isUserFirstEntrance } = getMenuSessionData();
			return forkJoin([this.areaToCredentialsService.getAreaTriangles(region), this.userAuthorizedAreas$]).pipe(
				mergeMap<any, any>(([trianglesOfArea, userAuthorizedAreas]: [any, any]) => {
					if (userAuthorizedAreas.some( area => trianglesOfArea.includes(area))) {
						return [new LoadOverlaysAction(action.payload),
							new SetBadgeAction({key: 'Permissions', badge: undefined})];
					}
					return [new LoadOverlaysSuccessAction([]),
						new SetOverlaysStatusMessageAction({ message: this.translate.instant(overlaysStatusMessages.noPermissionsForArea) }),
						new SetBadgeAction({key: 'Permissions', badge: isUserFirstEntrance ? '' : undefined})];
				}),
				catchError( () => {
					return [new LoadOverlaysAction(action.payload),
						new SetBadgeAction({key: 'Permissions', badge: undefined})];
				})
			)
		})

	);

	@Effect()
	loadOverlays$: Observable<{} | LoadOverlaysSuccessAction> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		switchMap((action: LoadOverlaysAction) => {
			if (action.payload.dataInputFilters.fullyChecked || action.payload.dataInputFilters.filters.length > 0) {
				return this.requestOverlays(action.payload);
			}
			else {
				return [new LoadOverlaysSuccessAction([])];
			}
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
					const errMsg = getErrorLogFromException(exception, `Failed to get overlay id=${action.payload.overlayId} sourceType=${action.payload.sourceType}`);
					this.loggerService.error(errMsg, 'overlays', 'Overlay_By_ID');
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
	dropsCount$ = this.store$.select(selectDrops).pipe(
		filter(Boolean),
		map<any, UpdateOverlaysCountAction>(drops => new UpdateOverlaysCountAction(drops.length)));


	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected translate: TranslateService,
				protected overlaysService: OverlaysService,
				protected loggerService: LoggerService,
				protected credentialsService: CredentialsService,
				protected areaToCredentialsService: AreaToCredentialsService) {
	}

	private requestOverlays(criteria: IOverlaysCriteria) {
		return this.overlaysService.search(criteria).pipe(
			// We use translate.instant instead of withLatestFrom + translate.get
			// Because of a bug: sometimes when starting the app the withLatestFrom that was here did not return,
			// and the timeline was stuck and not updated. After this fix the pipe works, but once in a while the
			// translations that are called here fail, and return the keys instead.
			mergeMap<IOverlaysFetchData, any>((overlays: IOverlaysFetchData) => {
				const noOverlayMatchQuery = this.translate.instant(overlaysStatusMessages.noOverLayMatchQuery);
				const overLoad = this.translate.instant(overlaysStatusMessages.overLoad);
				const error = this.translate.instant('Error on overlays request');
				const overlaysResult = Array.isArray(overlays.data) ? overlays.data : [];

				if (!Array.isArray(overlays.data) && Array.isArray(overlays.errors) && overlays.errors.length >= 0) {
					return [new LoadOverlaysSuccessAction(overlaysResult),
						new SetOverlaysStatusMessageAction({ message: error, originalMessages: overlays.errors })];
				}

				const actions: Array<any> = [new LoadOverlaysSuccessAction(overlaysResult)];

				// if data.length != fetchLimit that means only duplicate overlays removed
				if (!overlays.data || overlays.data.length === 0) {
					actions.push(new SetOverlaysStatusMessageAction({ message: noOverlayMatchQuery, originalMessages: overlays.errors }));
				} else if (overlays.limited > 0 && overlays.data.length === this.overlaysService.fetchLimit) {
					// TODO: replace when design is available
					actions.push(new SetOverlaysStatusMessageAction({ message: overLoad.replace('$overLoad', overlays.data.length.toString()) }));
				}
				return actions;
			}),
			catchError((err) => from([
				new LoadOverlaysSuccessAction([]),
				new SetOverlaysStatusMessageAction({
					message: 'Error on overlays request', originalMessages: [{ message: err }]
				})
			]))
		);
	}

}
