import { Injectable } from '@angular/core';
import { CommunicatorEntity, ImageryCommunicatorService, ImageryMapPosition, IMapSettings } from '@ansyn/imagery';
import { selectMaps, SetToastMessageAction, UpdateMapAction } from '@ansyn/map-facade';
import { AnnotationMode, DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Dictionary } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { EMPTY, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
	BackToWorldSuccess,
	BackToWorldView,
	OverlayStatusActionsTypes,
	ToggleDraggedModeAction
} from '../actions/overlay-status.actions';
import { SetAnnotationMode } from '../../../menu-items/tools/actions/tools.actions';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '../../actions/overlays.actions';
import { IOverlaysTranslationData } from '../../../menu-items/cases/models/case.model';
import { selectTranslationData } from '../reducers/overlay-status.reducer';


@Injectable()
export class OverlayStatusEffects {
	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.pipe(
			ofType(OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW),
			withLatestFrom(this.store$.select(selectMaps)),
			filter(([action, entities]: [BackToWorldView, Dictionary<IMapSettings>]) => Boolean(entities[action.payload.mapId])),
			map(([action, entities]: [BackToWorldView, Dictionary<IMapSettings>]) => {
				const mapId = action.payload.mapId;
				const selectedMap = entities[mapId];
				const communicator = this.communicatorsService.provide(mapId);
				const { position } = selectedMap.data;
				return [action.payload, selectedMap, communicator, position];
			}),
			filter(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => Boolean(communicator)),
			switchMap(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => {
				const disabledMap = communicator.activeMapName === DisabledOpenLayersMapName;
				this.store$.dispatch(new UpdateMapAction({
					id: communicator.id,
					changes: { data: { ...selectedMap.data, overlay: null, isAutoImageProcessingActive: false } }
				}));

				return fromPromise(disabledMap ? communicator.setActiveMap(OpenlayersMapName, position) : communicator.loadInitialMapSource(position))
					.pipe(
						map(() => new BackToWorldSuccess(payload)),
						catchError((err) => {
							console.error(OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW, err);
							this.store$.dispatch(new SetToastMessageAction({
								toastText: 'Failed to load map',
								showWarningIcon: true
							}));
							return EMPTY;
						})
					);
			})
		);

	@Effect()
	toggleTranslate$: Observable<any> = this.actions$.pipe(
		ofType(OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE),
		map((action: ToggleDraggedModeAction) => {
			let annotationMode = null;
			if (action.payload.dragged) {
				annotationMode = AnnotationMode.Translate;
			}
			return new SetAnnotationMode(annotationMode)
		})
	);

	@Effect()
	switchOverlayDisableTranslate$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS, OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS),
		withLatestFrom(this.store$.select(selectTranslationData)),
		mergeMap(([action, overlaysTranslationData]: [BackToWorldSuccess | DisplayOverlaySuccessAction, IOverlaysTranslationData]) => {
			const overlay = (<any>action.payload).overlay;
			const actions = [];
			if (overlay && overlay.id in overlaysTranslationData) {
				actions.push(new ToggleDraggedModeAction({overlayId: overlay.id, dragged: false}));
			}
			actions.push(new SetAnnotationMode(null));
			return actions;
		})
	);

	constructor(protected actions$: Actions,
				protected communicatorsService: ImageryCommunicatorService,
				protected store$: Store<any>) {
	}
}
