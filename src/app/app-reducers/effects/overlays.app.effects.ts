import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes,OverlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { ICasesState, Case, CaseMapState, CasesService } from '@ansyn/menu-items/cases';
import { LoadOverlaysAction, Overlay } from '@ansyn/overlays';
import { isEmpty, cloneDeep } from 'lodash';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { SetLoadingOverlaysAction } from '@ansyn/map-facade/actions/map.actions';

@Injectable()
export class OverlaysAppEffects {

	@Effect()
	onOverlaysMarkupsChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action,cases]:[Action,ICasesState]) => !isEmpty(cases.selected_case) )
		.map(([action,cases]:[Action,ICasesState])=> {
			const overlaysMarkup = this.casesService.getOverlaysMarkup(cases.selected_case);
			return new OverlaysMarkupAction(overlaysMarkup);
		});

	@Effect()
	selectCase$: Observable<LoadOverlaysAction | void> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([case_id, state]: [string, ICasesState]) => {
			return !isEmpty(state.selected_case);
		})
		.map(([caseId, state]: [string, ICasesState]) => {
			const caseSelected: Case = state.selected_case;

			const overlayFilter = {
				to: caseSelected.state.time.to,
				from: caseSelected.state.time.from,
				polygon: caseSelected.state.region,
				caseId: caseId
			};
			return new LoadOverlaysAction(overlayFilter);

		});


	@Effect()
	beforeDisplaySelectedOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.withLatestFrom(this.store$.select('map'), this.store$.select('cases'), (action: LoadOverlaysAction, mapState: IMapState, casesState: ICasesState): any => {
			return [action, cloneDeep(mapState.loadingOverlays), casesState.selected_case.state.maps.data];
		})
		.map(
			([LoadOverlaysAction, loadingOverlays, maps_data]: [Overlay[], string[], CaseMapState[]]) => {
				maps_data
					.filter((map: CaseMapState) =>{
						return !isEmpty(map.data.overlay);
					}).forEach((map: CaseMapState) => {
					loadingOverlays.push(map.data.overlay.id);
				});
				return new SetLoadingOverlaysAction(loadingOverlays);
			}
		).share();


	@Effect()
	displaySelectedOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.map(toPayload)
		.withLatestFrom(this.store$.select('map'), this.store$.select('cases'), (overlays: Overlay[], mapState: IMapState, casesState: ICasesState): any => {
			return [overlays, cloneDeep(mapState.loadingOverlays), casesState.selected_case.state.maps.data];
		})
		.mergeMap(
			([overlays, loadingOverlays, maps_data]: [Overlay[], string[], CaseMapState[]]) => {
				const displayOverlayActions = maps_data
					.filter((map: CaseMapState) =>{
						return !isEmpty(map.data.overlay);
					}).map((map: CaseMapState) => {
						const id = map.data.overlay.id;
						const map_id = map.id;
						const ignoreExtent = true;
						const OIndex = loadingOverlays.findIndex((_overlayId) => id == _overlayId);
						loadingOverlays.splice(OIndex, 1);

						return new DisplayOverlayAction({id, map_id, ignoreExtent})
					});
				return [new SetLoadingOverlaysAction(loadingOverlays), ...displayOverlayActions];
			}
		).share();



	constructor(public actions$: Actions, public store$: Store<IAppState>,public casesService : CasesService)
	{}
}
