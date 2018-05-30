import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import '@ansyn/core/utils/debug';
import '@ansyn/core/utils/clone-deep';
import { DisplayOverlayAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import {
	CasesActionTypes,
	CopyCaseLinkAction,
	LoadCaseAction,
	LoadDefaultCaseAction, LoadDefaultCaseIfNoActiveCaseAction, SelectCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Case } from '@ansyn/core/models/case.model';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { HttpErrorResponse } from '@angular/common/http';
import { uniqBy } from 'lodash';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';

@Injectable()
export class CasesAppEffects {

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
			let sCase = state.entities[action.payload.caseId];
			if (!sCase) {
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
	 * @name loadDefaultCaseIfNoActiveCase$
	 * @ofType LoadDefaultCaseIfNoActiveCaseAction
	 */
	@Effect()
	loadDefaultCaseIfNoActiveCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE)
		.withLatestFrom(this.store$.select(casesStateSelector))
		.filter(([action, casesState]: [LoadDefaultCaseAction, ICasesState]) => !Boolean(casesState.selectedCase))
		.map(() => new LoadDefaultCaseAction());

	/**
	 * @type Effect
	 * @name loadCase$
	 * @ofType LoadCaseAction
	 * @action SelectCaseAction?, SetToastMessageAction?, LoadDefaultCaseIfNoActiveCaseAction?
	 */
	@Effect()
	loadCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASE)
		.switchMap((action: LoadCaseAction) => this.casesService.loadCase(action.payload))
		.mergeMap((caseValue: Case) => {
			let resultObservable = Observable.of([]);

			const observablesArray = uniqBy(caseValue.state.maps.data.filter(mapData => Boolean(mapData.data.overlay))
				.map((mapData) => mapData.data.overlay)
				.concat(caseValue.state.favoriteOverlays), 'id')
				.map(({ id, sourceType }: Overlay) => this.overlaysService.getOverlayById(id, sourceType));

			if (observablesArray.length > 0) {
				resultObservable = Observable.forkJoin(observablesArray);
			}

			return resultObservable
				.map(overlays => new Map(overlays.map((overlay): [string, Overlay] => [overlay.id, overlay])))
				.map((mapOverlay: Map<string, Overlay>) => {
					caseValue.state.favoriteOverlays = caseValue.state.favoriteOverlays
						.map((favOverlay: Overlay) => mapOverlay.get(favOverlay.id));

					caseValue.state.maps.data
						.filter(mapData => Boolean(Boolean(mapData.data.overlay)))
						.forEach((map) => map.data.overlay = mapOverlay.get(map.data.overlay.id));

					return new SelectCaseAction(caseValue);
				});
		}).catch((result: HttpErrorResponse) => {
			return [new SetToastMessageAction({ toastText: `Failed to load case (${result.status})`, showWarningIcon: true }),
				new LoadDefaultCaseIfNoActiveCaseAction()];
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected casesService: CasesService,
				protected overlaysService: OverlaysService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
