import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IMapState, mapStateSelector, UpdateMapAction } from '@ansyn/map-facade';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { HttpErrorResponse } from '@angular/common/http';
import { uniqBy } from 'lodash';
import { IAppState } from '../app.effects.module';
import { catchError, map, mergeMap, withLatestFrom, tap } from 'rxjs/operators';
import { Inject } from '@angular/core';
import {
	CasesActionTypes,
	LoadDefaultCaseIfNoActiveCaseAction, SelectCaseAction, SelectDilutedCaseAction
} from '../../../../app/cases/actions/cases.actions';
import { IToolsConfig, toolsConfig } from '../../modules/menu-items/tools/models/tools-config';
import { IToolsState, toolsStateSelector } from '../../modules/menu-items/tools/reducers/tools.reducer';
import {
	DisplayOverlayAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes
} from '../../modules/overlays/actions/overlays.actions';
import { IOverlayByIdMetaData, OverlaysService } from '../../modules/overlays/services/overlays.service';
import { LoggerService } from '../../modules/core/services/logger.service';
import { IDilutedCase, ImageManualProcessArgs } from '../../../../app/cases/models/case.model';
import { IOverlay } from '../../modules/overlays/models/overlay.model';

@Injectable()
export class CasesAppEffects {
	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.config.ImageProcParams.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any> { ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.ADD_CASE,
			CasesActionTypes.DELETE_CASE,
			CasesActionTypes.LOAD_CASE,
			CasesActionTypes.LOAD_CASES,
			CasesActionTypes.ADD_CASES,
			CasesActionTypes.SAVE_CASE_AS,
			CasesActionTypes.SAVE_CASE_AS_SUCCESS,
			CasesActionTypes.UPDATE_CASE,
			CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS,
			CasesActionTypes.SELECT_CASE
		),
		tap((action) => {
			this.loggerService.info(JSON.stringify(action));
		}));

	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(toolsStateSelector)),
		map(([action, mapState, toolsState]: [DisplayOverlayAction, IMapState, IToolsState]) => {
			const mapId = action.payload.mapId || mapState.activeMapId;
			const currentMap = mapState.entities[mapId];
			const imageManualProcessArgs = (Boolean(toolsState && toolsState.overlaysManualProcessArgs) && toolsState.overlaysManualProcessArgs[action.payload.overlay.id]) || this.defaultImageManualProcessArgs;

			return new UpdateMapAction({
				id: mapId,
				changes: { data: {
					...currentMap.data,
						overlay: action.payload.overlay,
						isAutoImageProcessingActive: false,
						imageManualProcessArgs
					} }
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
							caseValue.state.presetOverlays || [])
					, 'id')
					.map(({ id, sourceType }: IOverlay): IOverlayByIdMetaData => ({ id, sourceType }));

				return this.overlaysService.getOverlaysById(ids)
					.pipe(
						map(overlays => new Map(overlays.map((overlay): [string, IOverlay] => [overlay.id, overlay]))),
						map((mapOverlay: Map<string, IOverlay>) => {
							caseValue.state.favoriteOverlays = caseValue.state.favoriteOverlays
								.map((favOverlay: IOverlay) => mapOverlay.get(favOverlay.id));

							caseValue.state.presetOverlays = (caseValue.state.presetOverlays || [])
								.map((preOverlay: IOverlay) => mapOverlay.get(preOverlay.id));

							caseValue.state.maps.data
								.filter(mapData => Boolean(Boolean(mapData.data.overlay)))
								.forEach((map) => map.data.overlay = mapOverlay.get(map.data.overlay.id));

							return new SelectCaseAction(caseValue);
						}),
						catchError((result: HttpErrorResponse) => {
							return [new SetToastMessageAction({
								toastText: `Failed to load case ${result.status ? `(${result.status})` : ''}`,
								showWarningIcon: true
							}),
								new LoadDefaultCaseIfNoActiveCaseAction()];
						})
					);
			})
		);


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected overlaysService: OverlaysService,
				@Inject(toolsConfig) protected config: IToolsConfig,
				protected loggerService: LoggerService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
