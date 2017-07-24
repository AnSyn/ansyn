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
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { SetTimelineStateAction } from '@ansyn/overlays/actions/overlays.actions';
import { SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';

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
		.filter(() => this.casesService.contextValues.imageryCount === -1)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([case_id, state]: [string, ICasesState]) => !isEmpty(state.selected_case))
		.map(([caseId, state]: [string, ICasesState]) => {
			const caseSelected: Case = state.selected_case;

			const overlayFilter: any = {
				to: caseSelected.state.time.to,
				from: caseSelected.state.time.from,
				polygon: caseSelected.state.region,
				caseId: caseId
			};
			return new LoadOverlaysAction(overlayFilter);
		});

	@Effect()
	selectCaseWithImageryCount$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.filter(() => this.casesService.contextValues.imageryCount !== -1)
		.withLatestFrom(this.store$.select('cases'), (action, cases: ICasesState) => cases.selected_case)
		.filter(selected_case => !isEmpty(selected_case))
		.switchMap((selected_case: Case) => {
			return this.overlaysService.getStartDateViaLimitFasets({
				region: selected_case.state.region,
				limit: this.casesService.contextValues.imageryCount,
				facets: selected_case.state.facets
			})
				.mergeMap((data: {startDate, endDate}) => {
					const from = new Date(data.startDate);
					const to = new Date(data.endDate);
					selected_case.state.time.from = from.toISOString();
					selected_case.state.time.to = to.toISOString();

					const overlayFilter: any = {
						to: selected_case.state.time.to,
						from: selected_case.state.time.from,
						polygon: selected_case.state.region,
						caseId: selected_case.id
					};

					return[
						new UpdateCaseAction(selected_case),
						new SetTimeAction({from, to}),
						new LoadOverlaysAction(overlayFilter)
					];
				})
		});



	@Effect()
	initTimelineStata$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.filter(() => this.casesService.contextValues.imageryCount !== -1)
		.withLatestFrom(this.store$.select('overlays'), (action, overlay: IOverlayState) => overlay.timelineState)
		.map((timelineState) => {
			const tenth = (timelineState.to.getTime() - timelineState.from.getTime()) / 10;
			const fromTenth = new Date(timelineState.from.getTime() - tenth);
			const toTenth = new Date(timelineState.to.getTime() + tenth);
			return new SetTimelineStateAction({from: fromTenth, to: toTenth});
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
						const OIndex = loadingOverlays.findIndex((_overlayId) => id === _overlayId);
						loadingOverlays.splice(OIndex, 1);

						return new DisplayOverlayAction({id, map_id});
					});
				return [new SetLoadingOverlaysAction(loadingOverlays), ...displayOverlayActions];
			}
		).share();

	@Effect()
	displayLatestOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS)
		.filter(action => this.casesService.contextValues.displayOverlay === 'latest')
		.withLatestFrom(this.store$.select('overlays'), (action, overlays: IOverlayState) => {
			const drops = this.overlaysService.parseOverlayDataForDispaly(overlays.overlays, overlays.filters);
			return drops[0].data;
		})
		.filter((displayedOverlays) => !isEmpty(displayedOverlays))
		.map((displayedOverlays: any[]) => {
			const lastOverlayId = displayedOverlays[displayedOverlays.length - 1].id;
			this.casesService.contextValues.displayOverlay = '';
			return new DisplayOverlayAction({id: lastOverlayId});
		})
		.share();


	constructor(public actions$: Actions, public store$: Store<IAppState>, public casesService: CasesService, public overlaysService: OverlaysService) {}
}
