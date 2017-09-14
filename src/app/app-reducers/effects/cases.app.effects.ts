import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes } from '@ansyn/overlays';
import { AddCaseAction, Case, CasesActionTypes, CasesService, ICasesState } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import '@ansyn/core/utils/debug';
import { IAppState } from '../';
import { isEmpty, isNil } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { SetLinkCopyToastValueAction } from '@ansyn/status-bar';
import {
	CopyCaseLinkAction,
	LoadContextsSuccessAction,
	LoadDefaultCaseAction,
	LoadDefaultCaseSuccessAction,
	SelectCaseByIdAction,
	SetDefaultCaseQueryParams
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { StatusBarActionsTypes } from '@ansyn/status-bar/actions/status-bar.actions';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { Context } from '@ansyn/core';
import { BaseContextSourceProvider, ContextCriteria } from '@ansyn/context';
import { EnableOnlyFavortiesSelectionAction } from '@ansyn/menu-items/filters/';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';


@Injectable()
export class CasesAppEffects {
	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, cases]: [Action, ICasesState]) => {
			return new EnableOnlyFavortiesSelectionAction(cases.selected_case.state.favoritesOverlays && !!cases.selected_case.state.favoritesOverlays.length);
		});

	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select('map'))
		.map(([action, mapState]: [DisplayOverlayAction, IMapState]) => {

			const updatedMapsList = [...mapState.mapsList];
			const mapId = action.payload.map_id || mapState.activeMapId;

			updatedMapsList.forEach((map) => {
				if (mapId === map.id) {
					map.data.overlay = action.payload.overlay;
				}
			});
			return new SetMapsDataActionStore({ mapsList: updatedMapsList });
		}).share();

	@Effect()
	onCopyShareCaseLink$ = this.actions$
		.ofType(CasesActionTypes.COPY_CASE_LINK)
		.withLatestFrom(this.store$.select('cases'), (action: CopyCaseLinkAction, state: ICasesState) => {
			let s_case = state.cases.find((case_value: Case) => case_value.id === action.payload);
			if (isNil(s_case)) {
				if (state.selected_case.id === action.payload) {
					s_case = state.selected_case;
				}
			}
			return s_case;
		})
		.map((s_case: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(s_case);
			const result = copyFromContent(shareLink);
			return new SetLinkCopyToastValueAction(result);
		});

	@Effect({dispatch: false})
	onOpenShareLink$ = this.actions$
		.ofType(StatusBarActionsTypes.OPEN_SHARE_LINK)
		.withLatestFrom(this.store$.select('cases'), (action: CopyCaseLinkAction, state: ICasesState) => {
			return state.selected_case;
		})
		.map((s_case: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(s_case);
			window.open(shareLink);
		});

	@Effect()
	saveDefaultCase$: Observable<AddCaseAction> = this.actions$
		.ofType(CasesActionTypes.SAVE_DEFAULT_CASE)
		.map(toPayload)
		.map((default_case: Case) => {

			this.casesService.enhanceDefaultCase(default_case);
			default_case.owner = 'Default Owner'; // TODO: replace with id from authentication service

			return new AddCaseAction(default_case);
		});

	@Effect()
	onLoadContexts$: Observable<LoadContextsSuccessAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_CONTEXTS)
		.withLatestFrom(this.store$.select('cases'))
		.switchMap(([action, state]: any[]) => {
			let observable: Observable<Context[]>;
			if (state.contexts_loaded) {
				observable = Observable.of(state.contexts);
			} else {
				const criteria = new ContextCriteria({start: 0, limit: 200});
				observable = this.contextSourceService.find(criteria);
				// observable = this.casesService.loadContexts();
			}
			return observable.map((contexts: Context[]) => {
				return new LoadContextsSuccessAction(contexts);
			});
		}).share();


	@Effect()
	loadDefaultCaseContext$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => action.payload['context'])
		.switchMap(
			(action: LoadDefaultCaseAction) => {
				return this.actions$
					.ofType(CasesActionTypes.LOAD_CONTEXTS_SUCCESS)
					.withLatestFrom(this.store$.select('cases'), (_, cases) => cases)
					.mergeMap((state: ICasesState) => {
						const actions = [];
						const defaultCase = this.casesService.getDefaultCase();
						const contextName = action.payload['context'];
						let defaultCaseQueryParams: Case;
						const context = state.contexts.find(c => c.name === contextName);
						if (context) {
							defaultCaseQueryParams = this.casesService.updateCaseViaContext(context, defaultCase, action.payload);
						} else {
							defaultCaseQueryParams = this.casesService.updateCaseViaQueryParmas({}, defaultCase);
						}
						actions.push(new SetDefaultCaseQueryParams(defaultCaseQueryParams));
						if (isEmpty(state.default_case)) {
							actions.push(new LoadDefaultCaseSuccessAction(defaultCase));
						} else {
							actions.push(new SelectCaseByIdAction(state.default_case.id));
						}
						return actions;
					});
			});


	constructor(private actions$: Actions,
				private store$: Store<IAppState>,
				private casesService: CasesService,
				public contextSourceService: BaseContextSourceProvider) {
	}
}
