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
import { SetToastMessageStoreAction } from '@ansyn/status-bar';
import {
	CopyCaseLinkAction,
	LoadContextsSuccessAction,
	LoadDefaultCaseAction,
	SelectCaseByIdAction,
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { StatusBarActionsTypes } from '@ansyn/status-bar/actions/status-bar.actions';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { Context } from '@ansyn/core';
import { BaseContextSourceProvider, ContextCriteria } from '@ansyn/context';
import { EnableOnlyFavortiesSelectionAction } from '@ansyn/menu-items/filters/';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';

@Injectable()
export class CasesAppEffects {
	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.map(({payload}: SelectCaseAction) => {
			return new EnableOnlyFavortiesSelectionAction(payload.state.favoritesOverlays && !!payload.state.favoritesOverlays.length);
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
			let sCase = state.cases.find((caseValue: Case) => caseValue.id === action.payload);
			if (isNil(sCase)) {
				if (state.selected_case.id === action.payload) {
					sCase = state.selected_case;
				}
			}
			return sCase;
		})
		.map((sCase: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			const result = copyFromContent(shareLink);
			return new SetToastMessageStoreAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		});

	@Effect({ dispatch: false })
	onOpenShareLink$ = this.actions$
		.ofType(StatusBarActionsTypes.OPEN_SHARE_LINK)
		.withLatestFrom(this.store$.select('cases'), (action: CopyCaseLinkAction, state: ICasesState) => {
			return state.selected_case;
		})
		.map((sCase: Case) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			window.open(shareLink);
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
				// const criteria = new ContextCriteria({ start: 0, limit: 200 });
				// observable = this.contextSourceService.find(criteria);
				observable = this.casesService.loadContexts();
			}
			return observable.map((contexts: Context[]) => {
				return new LoadContextsSuccessAction(contexts);
			});
		}).share();

	constructor(private actions$: Actions,
				private store$: Store<IAppState>,
				private casesService: CasesService,
				public contextSourceService: BaseContextSourceProvider) {
	}
}
