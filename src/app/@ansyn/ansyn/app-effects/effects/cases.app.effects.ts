import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, of, forkJoin } from 'rxjs';
import { IMapState, mapStateSelector, selectMapsIds, SetToastMessageAction, UpdateMapAction } from '@ansyn/map-facade';
import { IBaseImageryLayer, ImageryCommunicatorService } from '@ansyn/imagery';
import { HttpErrorResponse } from '@angular/common/http';
import { mapValues, uniqBy } from 'lodash';
import { IAppState } from '../app.effects.module';
import { catchError, filter, map, mergeMap, share, take, tap, withLatestFrom } from 'rxjs/operators';
import {
	CasesActionTypes, LoadDefaultCaseAction,
	LoadDefaultCaseIfNoActiveCaseAction,
	SelectCaseAction,
	SelectDilutedCaseAction
} from '../../modules/menu-items/cases/actions/cases.actions';
import { IToolsConfig, toolsConfig } from '../../modules/menu-items/tools/models/tools-config';
import {
	DisplayOverlayAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes
} from '../../modules/overlays/actions/overlays.actions';
import { IOverlayByIdMetaData, OverlaysService } from '../../modules/overlays/services/overlays.service';
import { LoggerService } from '../../modules/core/services/logger.service';
import { ICase, IDilutedCase, ImageManualProcessArgs } from '../../modules/menu-items/cases/models/case.model';
import { IOverlay } from '../../modules/overlays/models/overlay.model';
import {
	IOverlayStatusConfig,
	overlayStatusConfig
} from "../../modules/overlays/overlay-status/config/overlay-status-config";
import {
	IOverlayStatusState,
	overlayStatusStateSelector
} from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { casesConfig } from '../../modules/menu-items/cases/services/cases.service';
import { ICasesConfig } from '../../modules/menu-items/cases/models/cases-config';
import { fromPromise } from 'rxjs/internal-compatibility';

const IMISIGHT_OVERLAY_SOURCE_TYPE = 'IMISIGHT';

@Injectable()
export class CasesAppEffects {
	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.overlayStatusConfig.ImageProcParams.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.ADD_CASE,
			CasesActionTypes.DELETE_CASE,
			CasesActionTypes.LOAD_CASE,
			CasesActionTypes.LOAD_CASES,
			CasesActionTypes.LOAD_DEFAULT_CASE,
			CasesActionTypes.SAVE_CASE_AS_SUCCESS,
			CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS,
			CasesActionTypes.COPY_CASE_LINK
		),
		tap((action) => {
			this.loggerService.info(action.payload ? JSON.stringify(action.payload) : '', 'Cases', action.type);
		}));

	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(overlayStatusStateSelector)),
		map(([action, mapState, overlayStatusState]: [DisplayOverlayAction, IMapState, IOverlayStatusState]) => {
			const mapId = action.payload.mapId || mapState.activeMapId;
			const currentMap = mapState.entities[mapId];
			const imageManualProcessArgs = (Boolean(overlayStatusState && overlayStatusState.overlaysManualProcessArgs) && overlayStatusState.overlaysManualProcessArgs[action.payload.overlay.id]) || this.defaultImageManualProcessArgs;

			return new UpdateMapAction({
				id: mapId,
				changes: {
					data: {
						...currentMap.data,
						overlay: action.payload.overlay,
						isAutoImageProcessingActive: false,
						imageManualProcessArgs
					}
				}
			});
		})
	);

	@Effect()
	loadCase$: Observable<any> = this.actions$
		.pipe(
			ofType<SelectDilutedCaseAction>(CasesActionTypes.SELECT_DILUTED_CASE),
			map(({ payload }: SelectDilutedCaseAction) => payload),
			mergeMap((caseValue: IDilutedCase) => {
				const ids: IOverlayByIdMetaData[] = uniqBy(caseValue.state.maps.data.filter(mapData => Boolean(mapData.data.overlay))
						.map((mapData) => mapData.data.overlay)
						.concat(caseValue.state.favoriteOverlays,
							caseValue.state.presetOverlays || [],
							Object.values(caseValue.state.miscOverlays || {}).filter(Boolean))
					, 'id')
					.map(({ id, sourceType }: IOverlay): IOverlayByIdMetaData => ({ id, sourceType }));

				/* At this time, imisight's api doesn't have a "get by id" endpoint, so in order to fetch
				 * overlays for the selected case, we use the "search" method with the case's params.
				 * Other overlays (which sourcetypes aren't imisight) are fetched by id.
				 */

				const imisightIds: IOverlayByIdMetaData[] = [];
				const otherIds: IOverlayByIdMetaData[] = [];

				ids.forEach(id => {
					id.sourceType === IMISIGHT_OVERLAY_SOURCE_TYPE ?
						imisightIds.push(id) :
						otherIds.push(id);
				});

				const imisightOverlay$: Observable<IOverlay[]> = !imisightIds.length ?
					of([]) : 
					this.overlaysService.search({
						dataInputFilters: caseValue.state.dataInputFilters,
						region: caseValue.state.region,
						time: {
							from: caseValue.state.time.from,
							to: caseValue.state.time.to
						}
					}).pipe(map(overlaysFetchedData => overlaysFetchedData.data));

				return forkJoin(imisightOverlay$, this.overlaysService.getOverlaysById(otherIds)).pipe(
					map(([imisightOverlays, otherOverlays]) => ([...imisightOverlays, ...otherOverlays])),
					map(overlays => new Map(overlays.map((overlay): [string, IOverlay] => [overlay.id, overlay]))),
					map((mapOverlay: Map<string, IOverlay>) => {
						caseValue.state.favoriteOverlays = caseValue.state.favoriteOverlays
							.map((favOverlay: IOverlay) => mapOverlay.get(favOverlay.id));

						caseValue.state.presetOverlays = (caseValue.state.presetOverlays || [])
							.map((preOverlay: IOverlay) => mapOverlay.get(preOverlay.id));

						caseValue.state.miscOverlays = mapValues(caseValue.state.miscOverlays || {},
							(prevOverlay: IOverlay) => {
								return prevOverlay && mapOverlay.get(prevOverlay.id);
							});

						caseValue.state.maps.data
							.filter(mapData => Boolean(Boolean(mapData.data.overlay)))
							.forEach((map) => map.data.overlay = mapOverlay.get(map.data.overlay.id));

						return new SelectCaseAction(caseValue);
					}),
					catchError<any, any>((result: HttpErrorResponse) => {
						console.warn(result);
						return [new SetToastMessageAction({
							toastText: `Failed to load case ${ result.status ? `(${ result.status })` : '' }`,
							showWarningIcon: true
						}),
							new LoadDefaultCaseIfNoActiveCaseAction()];
					})
				);
			})
		);

	@Effect()
	onLoadDefaultCase$: Observable<IBaseImageryLayer> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_DEFAULT_CASE),
		withLatestFrom(this.store$.select(selectMapsIds)),
		filter(([action, [mapId]]: [LoadDefaultCaseAction, string[]]) => !action.payload.context && Boolean(mapId)),
		mergeMap(([action, [mapId]]: [LoadDefaultCaseAction, string[]]) => {
			const position = this.caseConfig.defaultCase.state.maps.data[0].data.position;
			const communicator = this.imageryCommunicatorService.provide(mapId);
			return fromPromise(communicator.loadInitialMapSource(position));
		}));


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected overlaysService: OverlaysService,
				@Inject(toolsConfig) protected config: IToolsConfig,
				@Inject(overlayStatusConfig) protected overlayStatusConfig: IOverlayStatusConfig,
				protected loggerService: LoggerService,
				@Inject(casesConfig) public caseConfig: ICasesConfig,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
