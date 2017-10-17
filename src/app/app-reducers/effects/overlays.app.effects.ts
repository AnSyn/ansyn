import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayFromStoreAction,
	OverlaysActionTypes,
	OverlaysMarkupAction,
	SetTimelineStateAction
} from '@ansyn/overlays/actions/overlays.actions';
import { CasesActionTypes, SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { CasesService, ICasesState } from '@ansyn/menu-items/cases';
import { LoadOverlaysAction } from '@ansyn/overlays';
import { isEmpty, last } from 'lodash';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { IOverlaysState, TimelineState } from '@ansyn/overlays/reducers/overlays.reducer';
import { SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';

@Injectable()
export class OverlaysAppEffects {

	/**
	 * @type Effect
	 * @name onOverlaysMarkupsChanged$
	 * @ofType LoadOverlaysSuccessAction
	 * @dependencies cases
	 * @filter There is a selected case
	 * @action OverlaysMarkupAction
	 */
	@Effect()
	onOverlaysMarkupsChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select(casesStateSelector))
		.filter(([action, cases]: [Action, ICasesState]) => !isEmpty(cases.selectedCase))
		.map(([action, cases]: [Action, ICasesState]) => {
			const overlaysMarkup = CasesService.getOverlaysMarkup(cases.selectedCase);
			return new OverlaysMarkupAction(overlaysMarkup);
		});

	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @filter There is an imagery count and the case is not empty
	 * @action LoadOverlaysAction
	 */
	@Effect()
	selectCase$: Observable<LoadOverlaysAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter((action: SelectCaseAction) => this.casesService.contextValues.imageryCount === -1)
		.filter((action: SelectCaseAction) => !isEmpty(action.payload))
		.map(({ payload }: SelectCaseAction) => {
			const overlayFilter: any = {
				to: payload.state.time.to,
				from: payload.state.time.from,
				polygon: payload.state.region,
				caseId: payload.id
			};
			return new LoadOverlaysAction(overlayFilter);
		});

	/**
	 * @type Effect
	 * @name selectCaseWithImageryCount$
	 * @ofType SelectCaseAction
	 * @filter There is an imagery count and the case is not empty
	 * @action UpdateCaseAction, SetTimeAction, LoadOverlaysAction
	 */
	@Effect()
	selectCaseWithImageryCount$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(() => this.casesService.contextValues.imageryCount !== -1)
		.filter(({ payload }: SelectCaseAction) => !isEmpty(payload))
		.switchMap(({ payload }: SelectCaseAction) => {
			return this.overlaysService.getStartDateViaLimitFasets({
				region: payload.state.region,
				limit: this.casesService.contextValues.imageryCount,
				facets: payload.state.facets
			})
				.mergeMap((data: { startDate, endDate }) => {
					const from = new Date(data.startDate);
					const to = new Date(data.endDate);
					payload.state.time.from = from.toISOString();
					payload.state.time.to = to.toISOString();

					const overlayFilter: any = {
						to: payload.state.time.to,
						from: payload.state.time.from,
						polygon: payload.state.region,
						caseId: payload.id
					};

					return [
						new UpdateCaseAction(payload),
						new SetTimeAction({ from, to }),
						new LoadOverlaysAction(overlayFilter)
					];
				});
		});

	/**
	 * @type Effect
	 * @name initTimelineState$
	 * @ofType LoadOverlaysSuccessAction
	 * @filter There is an imagery count
	 * @dependencies overlays
	 * @action SetTimelineStateAction
	 */
	@Effect()
	initTimelineState$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.filter(() => this.casesService.contextValues.imageryCount !== -1)
		.do(() => this.casesService.contextValues.imageryCount = -1)
		.withLatestFrom(this.store$.select(overlaysStateSelector).pluck <IOverlaysState, TimelineState>('timelineState'), (action, timelineState: TimelineState) => timelineState)
		.map(({ from, to }: TimelineState) => {
			const tenth = (to.getTime() - from.getTime()) / 10;
			const fromTenth = new Date(from.getTime() - tenth);
			const toTenth = new Date(to.getTime() + tenth);
			return new SetTimelineStateAction({ state: { from: fromTenth, to: toTenth } });
		});

	/**
	 * @type Effect
	 * @name displayLatestOverlay$
	 * @ofType SetFiltersAction
	 * @dependencies overlays
	 * @filter defaultOverlay is latest and displayedOverlays is not empty
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	displayLatestOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS)
		.filter(action => this.casesService.contextValues.defaultOverlay === 'latest')
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action, overlays: IOverlaysState) => {
			return overlays.filteredOverlays;
		})
		.filter((displayedOverlays) => !isEmpty(displayedOverlays))
		.map((displayedOverlays: any[]) => {
			const lastOverlayId = last(displayedOverlays);
			this.casesService.contextValues.defaultOverlay = '';
			return new DisplayOverlayFromStoreAction({ id: lastOverlayId });
		})
		.share();

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public casesService: CasesService,
				public overlaysService: OverlaysService) {
	}

}
