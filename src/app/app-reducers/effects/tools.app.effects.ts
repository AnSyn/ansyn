import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IAppState } from '../';
import { CasesActionTypes, SelectCaseByIdAction, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';
import { ToolsActionsTypes, DisableImageProcessing, EnableImageProcessing, ToggleAutoImageProcessing, ToggleAutoImageProcessingSuccess } from '@ansyn/menu-items/tools';
import { ICasesState } from '@ansyn/menu-items/cases';
import { cloneDeep } from 'lodash';
import { MapActionTypes, ToggleMapAutoImageProcessing, BackToWorldAction, ActiveMapChangedAction } from '@ansyn/map-facade';
import { OverlaysActionTypes, DisplayOverlaySuccessAction } from '@ansyn/overlays';

@Injectable()
export class ToolsAppEffects {

    @Effect()
    onActiveMapChanges$: Observable<ActiveMapChangedAction> = this.actions$
        .ofType(MapActionTypes.ACTIVE_MAP_CHANGED)
        .withLatestFrom(this.store$.select('cases'))
        .mergeMap(([action, casesState]: [ActiveMapChangedAction, ICasesState]) => {
            const mapId = casesState.selected_case.state.maps.active_map_id;
            const active_map = casesState.selected_case.state.maps.data.find((map) => map.id === mapId);

            if (active_map.data.overlay == null) {
                return [new DisableImageProcessing()];
            } else {
                return [
                    new EnableImageProcessing(),
                    new ToggleAutoImageProcessingSuccess(active_map.data.isAutoImageProcessingActive)
                ];                
            }
        });

    @Effect()
    onDisplayOverlay$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
        .map(() => new EnableImageProcessing());

    @Effect()
    onDisplayOverlaySuccess$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
        .withLatestFrom(this.store$.select('cases'), (action: DisplayOverlaySuccessAction, casesState: ICasesState) => {
            const mapId = casesState.selected_case.state.maps.active_map_id;
            const active_map = casesState.selected_case.state.maps.data.find((map) => map.id === mapId);
            return [mapId, active_map.data.isAutoImageProcessingActive];
        })
        .mergeMap(([mapId, isAutoImageProcessingActive]: [string, boolean]) => {
            return [
                new ToggleMapAutoImageProcessing({ mapId: mapId, toggle_value: isAutoImageProcessingActive }),
                new ToggleAutoImageProcessingSuccess(isAutoImageProcessingActive)
            ];
        });

    @Effect()
    backToWorldView$: Observable<any> = this.actions$
        .ofType(MapActionTypes.BACK_TO_WORLD)
        .map(() => new DisableImageProcessing());


    @Effect()
    onSelectCaseById$: Observable<DisableImageProcessing> = this.actions$
        .ofType(CasesActionTypes.SELECT_CASE_BY_ID)
        .map(() => new DisableImageProcessing());

    @Effect()
    toggleAutoImageProcessing$: Observable<any> = this.actions$
        .ofType(ToolsActionsTypes.TOGGLE_AUTO_IMAGE_PROCESSING)
        .withLatestFrom(this.store$.select('cases'), (action: ToggleAutoImageProcessing, casesState: ICasesState) => {
            const mapId = casesState.selected_case.state.maps.active_map_id;
            return [action, casesState, mapId];
        })
        .mergeMap(([action, caseState, mapId]: [ToggleAutoImageProcessing, ICasesState, string]) => {
            let shouldAutoImageProcessing;
            const updatedCase = cloneDeep(caseState.selected_case);
            updatedCase.state.maps.data.forEach(
                (map) => {
                    if (map.id === mapId) {
                        map.data.isAutoImageProcessingActive = !map.data.isAutoImageProcessingActive;
                        shouldAutoImageProcessing = map.data.isAutoImageProcessingActive;
                    }
                });

            return [
                new ToggleMapAutoImageProcessing({ mapId: mapId, toggle_value: shouldAutoImageProcessing }),
                new UpdateCaseAction(updatedCase),
                new ToggleAutoImageProcessingSuccess(shouldAutoImageProcessing)
            ];
        });

    constructor(private actions$: Actions,
        private store$: Store<IAppState>
    ) { }
}
