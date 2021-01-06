import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { selectMapStateById, SetToastMessageAction, UpdateMapAction } from '@ansyn/map-facade';
import { HttpErrorResponse } from '@angular/common/http';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { cloneDeep, mapValues, uniqBy } from 'lodash';
import { IAppState } from '../app.effects.module';
import { catchError, concatMap, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import {
	CasesActionTypes,
	LoadDefaultCaseAction,
	LoadDefaultCaseIfNoActiveCaseAction,
	SelectCaseAction,
	SelectDilutedCaseAction
} from '../../modules/menu-items/cases/actions/cases.actions';
import { IToolsConfig, toolsConfig } from '../../modules/menu-items/tools/models/tools-config';
import {
	DisplayOverlayAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
} from '../../modules/overlays/actions/overlays.actions';
import { IOverlayByIdMetaData, OverlaysService } from '../../modules/overlays/services/overlays.service';
import { ICase, IDilutedCase } from '../../modules/menu-items/cases/models/case.model';
import { IOverlay } from '../../modules/overlays/models/overlay.model';
import { casesConfig, CasesService } from '../../modules/menu-items/cases/services/cases.service';
import { ICasesConfig } from '../../modules/menu-items/cases/models/cases-config';

@Injectable()
export class CasesAppEffects {

	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		concatMap((action) => of(action).pipe(
			withLatestFrom(this.store$.pipe(select(selectMapStateById(action.payload.mapId))))
		)),
		map(([action, currentMap]) => {
			const mapId = action.payload.mapId;

			return new UpdateMapAction({
				id: mapId,
				changes: {
					data: {
						...currentMap.data,
						overlay: action.payload.overlay
					}
				}
			});
		})
	);
	@Effect()
	loadDefaultCase$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter((action: LoadDefaultCaseAction) => !action.payload.context),
		mergeMap(() => {
			const defaultCase = cloneDeep(this.casesService.defaultCase);
			// the default map id is null, so we generate a new id
			// for the initial map
			const defaultMapId = this.casesService.generateUUID();
			defaultCase.state.maps.data[0].id = defaultMapId;
			defaultCase.state.maps.activeMapId = defaultMapId;
			const defaultCaseQueryParams: ICase = this.casesService.parseCase(defaultCase);
			return [ new SelectDilutedCaseAction(defaultCaseQueryParams)];
		}));
	@Effect()
	loadCase$: Observable<any> = this.actions$
		.pipe(
			ofType<SelectDilutedCaseAction>(CasesActionTypes.SELECT_DILUTED_CASE),
			map(({ payload }: SelectDilutedCaseAction) => payload),
			mergeMap((caseValue: IDilutedCase) => {
				const ids: IOverlayByIdMetaData[] = uniqBy(caseValue.state.maps.data.filter(mapData => Boolean(mapData.data.overlay))
						.map((mapData) => mapData.data.overlay)
						.concat(caseValue.state.favoriteOverlays,
							Object.values(caseValue.state.miscOverlays || {}).filter(Boolean))
					, 'id')
					.map(({ id, sourceType }: IOverlay): IOverlayByIdMetaData => ({ id, sourceType }));

				return this.overlaysService.getOverlaysById(ids)
					.pipe(
						map(overlays => new Map(overlays.map((overlay): [string, IOverlay] => [overlay.id, overlay]))),
						concatMap((mapOverlay: Map<string, IOverlay>) => {
							let newCaseValue: IDilutedCase = this.getFullOverlays(caseValue, mapOverlay);
							const overlayToDisplay = newCaseValue.state.maps.data.filter(mapData => Boolean(mapData.data.overlay))
								.map(map => new DisplayOverlayAction({ overlay: map.data.overlay, mapId: map.id }));
							return [new SelectCaseAction(newCaseValue), ...overlayToDisplay];
						}),
						catchError<any, any>((error: HttpErrorResponse) => {
							const errMsg = error.message ? error.message : error.toString();
							console.warn(errMsg);
							return [new SetToastMessageAction({
								toastText: `Failed to load case ${ error.status ? `(${ error.status })` : '' }`,
								showWarningIcon: true,
								originalMessage: errMsg
							}),
								new LoadDefaultCaseIfNoActiveCaseAction()];
						})
					);
			})
		);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected casesService: CasesService,
				protected overlaysService: OverlaysService,
				@Inject(toolsConfig) protected config: IToolsConfig,
				@Inject(casesConfig) public caseConfig: ICasesConfig,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	getFullOverlays(oldCase: ICase, overlaysMap: Map<string, IOverlay>): ICase {
		return {
			...oldCase, state: {
				...oldCase.state,
				favoriteOverlays: oldCase.state.favoriteOverlays
					.map((favOverlay: IOverlay) => overlaysMap.get(favOverlay.id)),
				miscOverlays: mapValues(oldCase.state.miscOverlays || {},
					(prevOverlay: IOverlay) => {
						return prevOverlay && overlaysMap.get(prevOverlay.id);
					}),
				maps: {
					...oldCase.state.maps,
					data: oldCase.state.maps.data
						.map(mapData => ({
							...mapData,
							data: {
								...mapData.data,
								overlay: mapData.data.overlay && overlaysMap.get(mapData.data.overlay.id)
							}
						}))
				}
			}
		};
	}
}
