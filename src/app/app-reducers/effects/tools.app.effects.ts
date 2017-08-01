import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IAppState } from '../';
import { CasesActionTypes, SelectCaseByIdAction, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';
import { ToolsActionsTypes, DisableImageProcessing, EnableImageProcessing, ToggleImageProcessing, ToggleImageProcessingSuccess } from '@ansyn/menu-items/tools';
import { ICasesState } from '@ansyn/menu-items/cases';
import { cloneDeep } from 'lodash';
import { MapActionTypes, ToggleMapImageProcessing, BackToWorldAction } from '@ansyn/map-facade';
import { OverlaysActionTypes, DisplayOverlaySuccessAction } from '@ansyn/overlays';

@Injectable()
export class ToolsAppEffects {

    @Effect()
    onDisplayOverlay$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
        .map(() => new EnableImageProcessing());

    @Effect()
    onDisplayOverlaySuccess$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
        .withLatestFrom(this.store$.select('cases'), (action: DisplayOverlaySuccessAction, casesState: ICasesState) => {
            const mapId = casesState.selected_case.state.maps.active_map_id;
            const active_map = casesState.selected_case.state.maps.data.find((map)=> map.id === mapId);
            return [mapId, active_map.data.isHistogramActive];
        })
        .mergeMap(([mapId, isHistogramActive]: [string, boolean]) => {
            return [
                new ToggleMapImageProcessing({ mapId: mapId, toggle_value: isHistogramActive }),
                new ToggleImageProcessingSuccess(isHistogramActive)
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
    toggleHistogram$: Observable<any> = this.actions$
        .ofType(ToolsActionsTypes.TOGGLE_IMAGE_PROCESSING)
        .withLatestFrom(this.store$.select('cases'), (action: ToggleImageProcessing, casesState: ICasesState) => {
            const mapId = casesState.selected_case.state.maps.active_map_id;
            return [action, casesState, mapId];
        })
        .mergeMap(([action, caseState, mapId]: [ToggleImageProcessing, ICasesState, string]) => {
            let shouldPerformHist;
            const updatedCase = cloneDeep(caseState.selected_case);
            updatedCase.state.maps.data.forEach(
                (map) => {
                    if (map.id === mapId) {
                        map.data.isHistogramActive = !map.data.isHistogramActive;
                        shouldPerformHist = map.data.isHistogramActive;
                    }
                });

            return [
                new ToggleMapImageProcessing({ mapId: mapId, toggle_value: shouldPerformHist }),
                new UpdateCaseAction(updatedCase),
                new ToggleImageProcessingSuccess(shouldPerformHist)
            ];
        });

    constructor(private actions$: Actions,
        private store$: Store<IAppState>
    ) { }
}
