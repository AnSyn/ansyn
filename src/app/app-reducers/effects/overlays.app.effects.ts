import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayFromStoreAction,
	OverlaysActionTypes,
	OverlaysMarkupAction,
	SetTimelineStateAction
} from '@ansyn/overlays/actions/overlays.actions';
import { CasesActionTypes, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { Case, CasesService, ICasesState } from '@ansyn/menu-items/cases';
import { LoadOverlaysAction } from '@ansyn/overlays';
import { isEmpty, last } from 'lodash';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';

@Injectable()
export class OverlaysAppEffects {


	@Effect()
	onOverlaysMarkupsChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, cases]: [Action, ICasesState]) => !isEmpty(cases.selected_case))
		.map(([action, cases]: [Action, ICasesState]) => {
			const overlaysMarkup = CasesService.getOverlaysMarkup(cases.selected_case);
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
				.mergeMap((data: { startDate, endDate }) => {
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

					return [
						new UpdateCaseAction(selected_case),
						new SetTimeAction({from, to}),
						new LoadOverlaysAction(overlayFilter)
					];
				});
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
	displayLatestOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS)
		.filter(action => this.casesService.contextValues.defaultOverlay === 'latest')
		.withLatestFrom(this.store$.select('overlays'), (action, overlays: IOverlayState) => {
			return overlays.filteredOverlays;
		})
		.filter((displayedOverlays) => !isEmpty(displayedOverlays))
		.map((displayedOverlays: any[]) => {
			const lastOverlayId = last(displayedOverlays);
			this.casesService.contextValues.defaultOverlay = '';
			return new DisplayOverlayFromStoreAction({id: lastOverlayId});
		})
		.share();


	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public casesService: CasesService,
				public overlaysService: OverlaysService) {
	}

}
