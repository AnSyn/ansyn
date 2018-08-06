import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import {
	AddCaseAction,
	AddCasesAction,
	CasesActionTypes,
	CopyCaseLinkAction,
	LoadCasesAction,
	LoadDefaultCaseAction,
	SaveCaseAsAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState, selectCaseTotal } from '../reducers/cases.reducer';
import { ICasesConfig } from '../models/cases-config';
import { ICase, ICasePreview, IDilutedCaseState } from '@ansyn/core/models/case.model';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { IStoredEntity } from '@ansyn/core/services/storage/storage.service';
import {
	catchError, debounceTime, filter, map, mergeMap, share, switchMap,
	withLatestFrom
} from 'rxjs/internal/operators';
import { EMPTY } from 'rxjs/internal/observable/empty';
import {
	DeleteCaseAction,
	LoadCaseAction,
	ManualSaveAction,
	SelectDilutedCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { forkJoin } from 'rxjs/index';
import { UUID } from 'angular2-uuid';
import { selectLayers } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { pipe } from 'rxjs';

@Injectable()
export class CasesEffects {

	/**
	 * @type Effect
	 * @name loadCases$
	 * @ofType LoadCasesAction
	 * @dependencies cases
	 * @action LoadCasesSuccessAction
	 */
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

	/**
	 * @type Effect
	 * @name onAddCase$
	 * @ofType AddCaseAction
	 * @action SelectCaseAction
	 */
	@Effect()
	onAddCase$: Observable<SelectCaseAction> = this.actions$.pipe(
		ofType<AddCaseAction>(CasesActionTypes.ADD_CASE),
		map((action: AddCaseAction) => new SelectCaseAction(action.payload)),
		share());

	/**
	 * @type Effect
	 * @name onDeleteCase$
	 * @ofType DeleteCaseAction
	 * @dependencies cases
	 * @action LoadDefaultCaseAction?, DeleteCaseBackendAction
	 */
	@Effect()
	onDeleteCase$: Observable<any> = this.actions$.pipe(
		ofType<DeleteCaseAction>(CasesActionTypes.DELETE_CASE),
		mergeMap((action) => this.dataLayersService.removeCaseLayers(action.payload).pipe(map(() => action))),
		withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState) => [state.modal.id, state.selectedCase.id]),
		filter(([modalCaseId, selectedCaseId]) => modalCaseId === selectedCaseId),
		map(() => new LoadDefaultCaseAction())
	);

	/**
	 * @type Effect
	 * @name onDeleteCaseLoadCases$
	 * @ofType DeleteCaseBackendSuccessAction
	 * @dependencies cases
	 * @filter state cases length is not larger than the paginationLimit
	 * @action LoadCasesAction
	 */
	@Effect()
	onDeleteCaseLoadCases$: Observable<LoadCasesAction> = this.actions$.pipe(
		ofType(CasesActionTypes.DELETE_CASE),
		withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total),
		filter((total: number) => total <= this.casesService.paginationLimit),
		map(() => new LoadCasesAction()),
		share());

	/**
	 * @type Effect
	 * @name onUpdateCase$
	 * @ofType UpdateCaseAction
	 * @dependencies cases
	 * @filter Not the default case
	 * @action UpdateCaseBackendAction
	 */
	@Effect()
	onUpdateCase$: Observable<UpdateCaseBackendAction> = this.actions$.pipe(
		ofType(CasesActionTypes.UPDATE_CASE),
		map((action: UpdateCaseAction) => [action, this.casesService.defaultCase.id]),
		filter(([action, defaultCaseId]: [UpdateCaseAction, string]) => action.payload.updatedCase.id !== defaultCaseId && (action.payload.updatedCase.autoSave || action.payload.forceUpdate)),
		map(([action]: [UpdateCaseAction]) => new UpdateCaseBackendAction(action.payload.updatedCase)),
		share());

	/**
	 * @type Effect
	 * @name onUpdateCaseBackend$
	 * @ofType UpdateCaseBackendAction
	 * @action UpdateCaseBackendSuccessAction
	 */
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

	/**
	 * @type Effect
	 * @name openModal$
	 * @ofType OpenModalAction
	 */
	@Effect({ dispatch: false })
	openModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.OPEN_MODAL);

	/**
	 * @type Effect
	 * @name closeModal$
	 * @ofType CloseModalAction
	 */
	@Effect({ dispatch: false })
	closeModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.CLOSE_MODAL);

	/**
	 * @type Effect
	 * @name loadDefaultCase$
	 * @ofType LoadDefaultCaseAction
	 * @filter Payload does not have context
	 * @action SelectCaseAction
	 */
	@Effect()
	loadDefaultCase$: Observable<SelectCaseAction> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter((action: LoadDefaultCaseAction) => !action.payload.context),
		map((action: LoadDefaultCaseAction) => {
			const defaultCaseQueryParams: ICase = this.casesService.updateCaseViaQueryParmas(action.payload, this.casesService.defaultCase);
			return new SelectCaseAction(defaultCaseQueryParams);
		}),
		share());

	/**
	 * @type Effect
	 * @name onSaveCaseAs$
	 * @ofType SaveCaseAsAction
	 * @action AddCaseAction
	 */
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

							addedCase.state.layers.activeLayersIds = addedCase.state.layers.activeLayersIds.map((id) => {
								return id === oldId ? newId : id;
							});

							return { ...layer, id: newId, caseId: addedCase.id };
						}).map((layer) => this.dataLayersService.addLayer(layer))
					)
						.pipe(map((_) => addedCase))
				),
				map((addedCase: ICase) => new SaveCaseAsSuccessAction(addedCase))
			)
		));

	/**
	 * @type Effect
	 * @name onCopyShareCaseIdLink$
	 * @ofType CopyCaseLinkAction
	 * @filter shareCaseAsQueryParams is false
	 * @action SetToastMessageAction
	 */
	@Effect()
	onCopyShareCaseIdLink$ = this.actions$.pipe(
		ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK),
		filter(action => !Boolean(action.payload.shareCaseAsQueryParams)),
		map((action) => {
			const shareLink = this.casesService.generateLinkWithCaseId(action.payload.caseId);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: statusBarToastMessages.showLinkCopyToast });
		}));

	/**
	 * @type Effect
	 * @name loadDefaultCaseIfNoActiveCase$
	 * @ofType LoadDefaultCaseIfNoActiveCaseAction
	 */
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
			catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load case')),
			catchError(() => EMPTY),
			map((dilutedCase) => new SelectDilutedCaseAction(dilutedCase))
		);

	saveLayers = pipe(
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

