import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes } from '@ansyn/overlays';
import { Case, CasesActionTypes, CasesService, ICasesState } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import '@ansyn/core/utils/debug';
import { IAppState } from '../';
import { isNil } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import {
	CopyCaseLinkAction,
	LoadContextsSuccessAction,
	SelectCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { StatusBarActionsTypes } from '@ansyn/status-bar/actions/status-bar.actions';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { Context } from '@ansyn/core';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { HideAnnotationsLayer, ShowAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';

@Injectable()
export class CasesAppEffects {

	/**
	 * @type Effect
	 * @name updateAnnotationLayersFlags$
	 * @ofType SelectCaseAction
	 * @action ShowAnnotationsLayer?, HideAnnotationsLayer?
	 */
	@Effect()
	updateAnnotationLayersFlags$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.map(({ payload }: SelectCaseAction) => {
			if (payload.state.layers && payload.state.layers.displayAnnotationsLayer) {
				return new ShowAnnotationsLayer({ update: false });
			} else {
				return new HideAnnotationsLayer({ update: false });
			}
		});


	/**
	 * @type Effect
	 * @name onDisplayOverlay$
	 * @ofType DisplayOverlayAction
	 * @action SetMapsDataActionStore
	 * @dependencies map
	 */
	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [DisplayOverlayAction, IMapState]) => {

			const updatedMapsList = [...mapState.mapsList];
			const mapId = action.payload.mapId || mapState.activeMapId;

			updatedMapsList.forEach((map) => {
				if (mapId === map.id) {
					map.data.overlay = action.payload.overlay;
				}
			});
			return new SetMapsDataActionStore({ mapsList: updatedMapsList });
		}).share();

	/**
	 * @type Effect
	 * @name onCopyShareCaseLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is true
	 * @action SetToastMessageAction
	 * @dependencies cases
	 */
	@Effect()
	onCopyShareCaseLink$ = this.actions$
		.ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK)
		.filter(action => Boolean(action.payload.shareCaseAsQueryParams))
		.withLatestFrom(this.store$.select(casesStateSelector), (action: CopyCaseLinkAction, state: ICasesState) => {
			let sCase = state.cases.find((caseValue: Case) => caseValue.id === action.payload.caseId);
			if (isNil(sCase)) {
				if (state.selectedCase.id === action.payload.caseId) {
					sCase = state.selectedCase;
				}
			}
			return sCase;
		})
		.map((sCase: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		});

	/**
	 * @type Effect
	 * @name onCopyShareCaseIdLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is false
	 * @action SetToastMessageAction
	 */
	@Effect()
	onCopyShareCaseIdLink$ = this.actions$
		.ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK)
		.filter(action => !Boolean(action.payload.shareCaseAsQueryParams))
		.map((action) => {
			const shareLink = this.casesService.generateLinkWithCaseId(action.payload.caseId);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		});
	/**
	 * @type Effect
	 * @name onOpenShareLink$
	 * @ofType OpenShareLink
	 * @dependencies cases
	 * @dispatch: false
	 */
	@Effect({ dispatch: false })
	onOpenShareLink$ = this.actions$
		.ofType(StatusBarActionsTypes.OPEN_SHARE_LINK)
		.withLatestFrom(this.store$.select(casesStateSelector), (action: CopyCaseLinkAction, state: ICasesState) => {
			return state.selectedCase;
		})
		.map((sCase: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			window.open(shareLink);
		});

	/**
	 * @type Effect
	 * @name onLoadContexts$
	 * @ofType LoadContextsAction
	 * @action LoadContextsSuccessAction
	 * @dependencies cases
	 */
	@Effect()
	onLoadContexts$: Observable<LoadContextsSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CONTEXTS)
		.withLatestFrom(this.store$.select(casesStateSelector))
		.switchMap(([action, state]: any[]) => {
			let observable: Observable<Context[]>;
			if (state.contextsLoaded) {
				observable = Observable.of(state.contexts);
			} else {
				// const criteria = new ContextCriteria({ start: 0, limit: 200 });
				// observable = this.contextSourceService.find(criteria);
				observable = this.casesService.loadContexts();
			}
			return observable.map((contexts: Context[]) => {
				return new LoadContextsSuccessAction(contexts);
			});
		}).share();

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected casesService: CasesService) {
	}
}
