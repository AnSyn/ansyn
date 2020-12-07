import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import {
	AddCasesAction,
	CasesActionTypes,
	CopyCaseLinkAction,
	DeleteCaseAction,
	DeleteCaseSuccessAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	OpenModalAction,
	RenameCaseAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SaveSharedCaseAsMyOwn,
	SelectDilutedCaseAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState, selectMyCasesTotal, selectSharedCaseTotal } from '../reducers/cases.reducer';
import { CasesType, ICasesConfig } from '../models/cases-config';
import { catchError, concatMap, filter, map, mergeMap, share, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { ILayer, LayerType } from '../../layers-manager/models/layers.model';
import { selectLayers } from '../../layers-manager/reducers/layers.reducer';
import { DataLayersService } from '../../layers-manager/services/data-layers.service';
import { copyFromContent, SetToastMessageAction } from '@ansyn/map-facade';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { toastMessages } from '../../../core/models/toast-messages';
import { fromPromise } from 'rxjs/internal-compatibility';
import { cloneDeep } from '../../../core/utils/rxjs/operators/cloneDeep';
import { RemoveCaseLayersFromBackendAction } from '../../layers-manager/actions/layers.actions';

@Injectable()
export class CasesEffects {

	@Effect()
	loadCases$: Observable<AddCasesAction | {}> = this.actions$.pipe(
		ofType<LoadCasesAction>(CasesActionTypes.LOAD_CASES),
		concatMap((action) => {
			const selector = action.payload === CasesType.MySharedCases ? this.store.select(selectSharedCaseTotal) : this.store.select(selectMyCasesTotal);
			return of(action).pipe(withLatestFrom(selector));
		}),
		concatMap(([action, total]: [LoadCasesAction, number]) => {
			return this.casesService.loadCases(action.fromBegin ? 0 : total, action.payload).pipe(
				map(cases => new AddCasesAction({ cases, type: action.payload })),
				catchError(() => EMPTY)
			);
		}),
		share());

	@Effect()
	onSaveCaseAs$ = this.actions$.pipe(
		ofType<SaveCaseAsAction>(CasesActionTypes.SAVE_CASE_AS),
		cloneDeep(),
		withLatestFrom(this.store.select(selectLayers)),
		mergeMap(([{ payload }, layers]: [SaveCaseAsAction, ILayer[]]) => {
			const newCase = { ...payload, id: this.casesService.generateUUID() };
			// regenerate maps id for the new case.
			const currentActive = newCase.state.maps.activeMapId;
			let newActiveMapId = currentActive;
			newCase.state.maps.data.forEach(map => {
				const mapId = map.id;
				map.id = this.casesService.generateUUID();
				if (mapId === currentActive) {
					newActiveMapId = map.id;
				}
			});
			newCase.state.maps.activeMapId = newActiveMapId;
			// regenerate layers id for the new case.
			return forkJoin(layers
				.filter(({ type }) => type === LayerType.annotation)
				.map((layer) => {
					const newLayerId = this.casesService.generateUUID();
					const oldLayerId = layer.id;
					newCase.state.layers.activeLayersIds = newCase.state.layers.activeLayersIds.map((id) => {
						return id === oldLayerId ? newLayerId : id;
					});
					return { ...layer, id: newLayerId, caseId: newCase.id }
				}).map((layer) => this.dataLayersService.addLayer(layer))
			).pipe(map((_) => newCase))
		}),
		mergeMap(newCase => this.casesService.createCase(newCase)),
		map((newCase) => new SaveCaseAsSuccessAction(newCase)),
		catchError((err) => {
			console.warn(err);
			return EMPTY;
		})
	);

	@Effect({ dispatch: false })
	onRenameCaseAction$ = this.actions$.pipe(
		ofType<RenameCaseAction>(CasesActionTypes.RENAME_CASE),
		mergeMap((action) => this.casesService.updateCase(action.payload.case))
	);

	@Effect()
	onCopyShareCaseIdLink$ = this.actions$.pipe(
		ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK),
		filter(action => !Boolean(action.payload.shareCaseAsQueryParams)),
		map((action) => {
			const shareLink = this.casesService.generateLinkById(action.payload.caseId);
			return fromPromise(copyFromContent(shareLink));
		}),
		map(() => new SetToastMessageAction({ toastText: toastMessages.showLinkCopyToast }))
	);

	@Effect()
	loadDefaultCaseIfNoActiveCase$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE),
		withLatestFrom(this.store.select(casesStateSelector)),
		filter(([action, casesState]: [LoadDefaultCaseAction, ICasesState]) => !Boolean(casesState.selectedCase)),
		map(() => new LoadDefaultCaseAction()));

	@Effect()
	loadCase$: Observable<any> = this.actions$
		.pipe(
			ofType(CasesActionTypes.LOAD_CASE),
			switchMap((action: LoadCaseAction) => this.casesService.loadCase(action.payload)),
			concatMap((dilutedCase) => [new SelectDilutedCaseAction(dilutedCase),
				new LoadCasesAction(CasesType.MySharedCases, true)]),
			catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load case')),
			catchError(() => of(new LoadDefaultCaseAction()))
		);

	@Effect()
	saveSharedCaseAsMyOwnPrepare$ = this.actions$.pipe(
		// at the first time we get the id of the shared case in we load it.
		ofType<SaveSharedCaseAsMyOwn>(CasesActionTypes.SAVE_SHARED_CASE_AS_MY_OWN),
		filter( ({payload}) => typeof payload === 'string'),
		mergeMap( ({payload}) => this.casesService.loadCase(<string>payload)),
		map( (dilutedCase) => new SaveSharedCaseAsMyOwn(dilutedCase))
	);

	@Effect()
	saveSharedCaseAsMyOwnReady$ = this.actions$.pipe(
		ofType<SaveSharedCaseAsMyOwn>(CasesActionTypes.SAVE_SHARED_CASE_AS_MY_OWN),
		filter( ({payload}) => typeof payload === 'object'),
		map( () => new OpenModalAction({type: 'save'}))
	);

	@Effect()
	onDeleteCase$: Observable<any> = this.actions$.pipe(
		ofType<DeleteCaseAction>(CasesActionTypes.DELETE_CASE),
		mergeMap((action) => this.casesService.removeCase(action.payload.id).pipe(map(_ => action))),
		mergeMap((action) => {
			const actions: any[] = [new DeleteCaseSuccessAction(action.payload)];
			if (action.payload.type === CasesType.MyCases) {
				actions.push(
					new RemoveCaseLayersFromBackendAction(action.payload.id))
			}
			return actions;
		})
	);

	constructor(protected actions$: Actions,
				protected casesService: CasesService,
				protected store: Store<ICasesState>,
				protected dataLayersService: DataLayersService,
				protected errorHandlerService: ErrorHandlerService,
				@Inject(casesConfig) public caseConfig: ICasesConfig) {
	}
}

