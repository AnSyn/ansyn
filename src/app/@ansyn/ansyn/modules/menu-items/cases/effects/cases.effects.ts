import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, forkJoin, Observable, of, pipe, UnaryFunction } from 'rxjs';
import {
	AddCasesAction,
	CasesActionTypes,
	CopyCaseLinkAction,
	DeleteCaseAction,
	LoadCaseAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	ManualSaveAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	SelectDilutedCaseAction,
	SetAutoSave,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState, selectCaseTotal, selectSelectedCase } from '../reducers/cases.reducer';
import { ICasesConfig } from '../models/cases-config';
import {
	catchError,
	concatMap,
	debounceTime,
	filter,
	map,
	mergeMap,
	share,
	switchMap,
	withLatestFrom
} from 'rxjs/operators';
import { ILayer, LayerType } from '../../layers-manager/models/layers.model';
import { UUID } from 'angular2-uuid';
import { selectLayers } from '../../layers-manager/reducers/layers.reducer';
import { DataLayersService } from '../../layers-manager/services/data-layers.service';
import {
	SetMapsDataActionStore,
	SetToastMessageAction
} from '@ansyn/map-facade';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IStoredEntity } from '../../../core/services/storage/storage.service';
import { rxPreventCrash } from '../../../core/utils/rxjs/operators/rxPreventCrash';
import { toastMessages } from '../../../core/models/toast-messages';
import { ICase, ICasePreview, IDilutedCaseState } from '../models/case.model';
import { BackToWorldView } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { fromPromise } from 'rxjs/internal-compatibility';
import { copyFromContent } from '@ansyn/map-facade';

@Injectable()
export class CasesEffects {

	@Effect()
	loadCases$: Observable<AddCasesAction | {}> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_CASES),
		withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total),
		switchMap((total: number) => {
			return this.casesService.loadCases(total).pipe(
				map(cases => new AddCasesAction(cases)),
				catchError(() => EMPTY)
			);
		}),
		share());

	@Effect()
	onDeleteCase$: Observable<any> = this.actions$.pipe(
		ofType<DeleteCaseAction>(CasesActionTypes.DELETE_CASE),
		mergeMap((action) => this.dataLayersService.removeCaseLayers(action.payload.id).pipe(map(() => action))),
		withLatestFrom(this.store.select(selectSelectedCase), ({ payload: { id: deletedCaseId }}, selectedCase: ICase) => [deletedCaseId, selectedCase.id]),
		filter(([deletedCaseId, selectedCaseId]) => deletedCaseId === selectedCaseId),
		map(() => new LoadDefaultCaseAction()),
		rxPreventCrash()
	);

	@Effect()
	onDeleteCaseLoadCases$: Observable<LoadCasesAction> = this.actions$.pipe(
		ofType(CasesActionTypes.DELETE_CASE),
		withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total),
		filter((total: number) => total <= this.casesService.paginationLimit),
		map(() => new LoadCasesAction()),
		share());

	@Effect()
	onUpdateCase$: Observable<UpdateCaseBackendAction> = this.actions$.pipe(
		ofType(CasesActionTypes.UPDATE_CASE),
		map((action: UpdateCaseAction) => [action, this.casesService.defaultCase.id]),
		filter(([action, defaultCaseId]: [UpdateCaseAction, string]) => action.payload.updatedCase.id !== defaultCaseId && (action.payload.updatedCase.autoSave || action.payload.forceUpdate)),
		map(([action, defaultCaseId]: [UpdateCaseAction, string]) => new UpdateCaseBackendAction(action.payload.updatedCase)),
		share());

	@Effect()
	onUpdateCaseBackendSaveAs$: Observable<UpdateCaseBackendSuccessAction | any> = this.actions$
		.pipe(
			ofType(CasesActionTypes.UPDATE_CASE_BACKEND_SAVE_AS),
			switchMap((action: UpdateCaseBackendAction) => {
				return this.casesService.updateCase(action.payload)
					.pipe(
						map((updatedCase: IStoredEntity<ICasePreview, IDilutedCaseState>) => new UpdateCaseBackendSuccessAction(updatedCase)),
						catchError(() => EMPTY)
					);

			})
		);

	@Effect()
	onUpdateCaseBackend$: Observable<UpdateCaseBackendSuccessAction | any> = this.actions$
		.pipe(
			ofType(CasesActionTypes.UPDATE_CASE_BACKEND),
			debounceTime(this.casesService.config.updateCaseDebounceTime),
			switchMap((action: UpdateCaseBackendAction) => {
				return this.casesService.updateCase(action.payload)
					.pipe(
						map((updatedCase: IStoredEntity<ICasePreview, IDilutedCaseState>) => new UpdateCaseBackendSuccessAction(updatedCase)),
						catchError(() => EMPTY)
					);

			})
		);

	@Effect()
	onSaveCaseAs$: Observable<SaveCaseAsSuccessAction> = this.actions$.pipe(
		ofType<SaveCaseAsAction>(CasesActionTypes.SAVE_CASE_AS),
		withLatestFrom(this.store.select(selectLayers)),
		mergeMap(([{ payload }, layers]: [SaveCaseAsAction, ILayer[]]) => this.casesService
			.createCase(payload).pipe(
				mergeMap((addedCase: ICase) => forkJoin(layers
						.filter(({ type }) => type === LayerType.annotation)
						.map((layer) => {
							const newId = UUID.UUID();
							const oldId = layer.id;

							addedCase =
								{
									...addedCase, state:
										{
											...addedCase.state, layers:
												{
													...addedCase.state.layers,
													activeLayersIds: addedCase.state.layers.activeLayersIds.map((id) => {
														return id === oldId ? newId : id;
													})
												}
										}
								};
							// addedCase.state.layers.activeLayersIds = addedCase.state.layers.activeLayersIds.map((id) => {
							// 	return id === oldId ? newId : id;
							// });
							// Todo: the new case was created by shallow cloning an existing case.
							//  The existing case is in the store, so this caused problems, and I
							//  had to do special cloning, as above. Perhaps it will be better to:
							//  (1) Do deep clone, rather than shallow clone, in the service, or
							//  (2) Do clonings only in the store/reducer, and not in service/effect

							return { ...layer, id: newId, caseId: addedCase.id };
						}).map((layer) => this.dataLayersService.addLayer(layer))
					)
						.pipe(map((_) => addedCase))
				),
				map((addedCase: ICase) => new SaveCaseAsSuccessAction(addedCase)),
				catchError((err) => {
					console.warn(err);
					return EMPTY;
				})
			)
		),
		catchError((err) => {
			console.warn(err);
			return EMPTY;
		})
	);

	@Effect()
	onSaveCaseAsSuccess$ = this.actions$.pipe(
		ofType<SaveCaseAsAction>(CasesActionTypes.SAVE_CASE_AS_SUCCESS),
		concatMap(({ payload }) => [
			new SetAutoSave(true),
			new SetMapsDataActionStore({ mapsList: payload.state.maps.data }),
		])
	);

	@Effect()
	onCopyShareCaseIdLink$ = this.actions$.pipe(
		ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK),
		filter(action => !Boolean(action.payload.shareCaseAsQueryParams)),
		map((action) => {
			const shareLink = this.casesService.generateLinkById(action.payload.caseId, 'case');
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
			map((dilutedCase) => new SelectDilutedCaseAction(dilutedCase)),
			catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load case')),
			catchError(() => of(new LoadDefaultCaseAction()))
		);

	saveLayers: UnaryFunction<any, any> = pipe(
		mergeMap((action: ManualSaveAction) => this.dataLayersService
			.removeCaseLayers(action.payload.id).pipe(
				withLatestFrom(this.store.select(selectLayers)),
				mergeMap(([deletedLayersIds, layers]: [string[], ILayer[]]) => forkJoin(layers.filter((layer) => layer.type === LayerType.annotation)
					.map((layer) => this.dataLayersService.addLayer(layer)))
					.pipe(map(() => action))
				)
			))
	);

	@Effect()
	manualSave$ = this.actions$.pipe(
		ofType<ManualSaveAction>(CasesActionTypes.MANUAL_SAVE),
		filter((action) => action.payload.id !== this.casesService.defaultCase.id),
		this.saveLayers,
		mergeMap((action: ManualSaveAction) => [
			new UpdateCaseAction({ updatedCase: action.payload, forceUpdate: true }),
			new SetToastMessageAction({ toastText: 'Case saved successfully' })
		]),
		catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to update case')),
		catchError(() => EMPTY)
	);

	constructor(protected actions$: Actions,
				protected casesService: CasesService,
				protected store: Store<ICasesState>,
				protected dataLayersService: DataLayersService,
				protected errorHandlerService: ErrorHandlerService,
				@Inject(casesConfig) public caseConfig: ICasesConfig) {
	}
}

