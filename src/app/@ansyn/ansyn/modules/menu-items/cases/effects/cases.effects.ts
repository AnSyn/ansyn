import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, forkJoin, Observable, of, pipe, UnaryFunction } from 'rxjs';
import {
	AddCaseAction,
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
import { casesStateSelector, ICasesState, selectCaseTotal } from '../reducers/cases.reducer';
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
	copyFromContent,
	SetMapsDataActionStore,
	SetToastMessageAction,
	selectActiveMapId,
	selectMapsIds
} from '@ansyn/map-facade';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IStoredEntity } from '../../../core/services/storage/storage.service';
import { rxPreventCrash } from '../../../core/utils/rxjs/operators/rxPreventCrash';
import { toastMessages } from '../../../core/models/toast-messages';
import { ICase, ICasePreview, IDilutedCaseState } from '../models/case.model';
import { BackToWorldView } from '../../../overlays/overlay-status/actions/overlay-status.actions';

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
	onAddCase$: Observable<SelectCaseAction | BackToWorldView> = this.actions$.pipe(
		ofType<AddCaseAction>(CasesActionTypes.ADD_CASE),
		mergeMap((action: AddCaseAction) => {
			const mapId = action.payload.state.maps.activeMapId;
			return [new SelectCaseAction(action.payload), new BackToWorldView({ mapId })];
		}),
		share());

	@Effect()
	onDeleteCase$: Observable<any> = this.actions$.pipe(
		ofType<DeleteCaseAction>(CasesActionTypes.DELETE_CASE),
		mergeMap((action) => this.dataLayersService.removeCaseLayers(action.payload).pipe(map(() => action))),
		withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState) => [state.modal.id, state.selectedCase.id]),
		filter(([modalCaseId, selectedCaseId]) => modalCaseId === selectedCaseId),
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

	@Effect({ dispatch: false })
	openModal$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.OPEN_MODAL));

	@Effect({ dispatch: false })
	closeModal$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.CLOSE_MODAL)
	);

	@Effect()
	loadDefaultCase$: Observable<SelectDilutedCaseAction> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_DEFAULT_CASE),
		withLatestFrom(this.store.select(selectMapsIds)),
		filter(([action, [mapId]]: [LoadDefaultCaseAction, string[]]) => !action.payload.context),
		mergeMap(([action, [mapId]]: [LoadDefaultCaseAction, string[]]) => {
			const defaultCaseQueryParams: ICase = this.casesService.updateCaseViaQueryParmas(action.payload, this.casesService.defaultCase);
			return [new SelectDilutedCaseAction(defaultCaseQueryParams)];
		}),
		share());

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
				map((addedCase: ICase) => new SaveCaseAsSuccessAction(addedCase)),
				catchError(() => EMPTY)
			)
		));

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
			const shareLink = this.casesService.generateLinkWithCaseId(action.payload.caseId);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: toastMessages.showLinkCopyToast });
		})
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

	@Effect()
	onCopyShareCaseLink$ = this.actions$.pipe(
		ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK),
		filter(action => Boolean(action.payload.shareCaseAsQueryParams)),
		withLatestFrom(this.store.select(casesStateSelector), (action: CopyCaseLinkAction, state: ICasesState) => {
			let sCase = state.entities[action.payload.caseId];
			if (!sCase) {
				if (state.selectedCase.id === action.payload.caseId) {
					sCase = state.selectedCase;
				}
			}
			return sCase;
		}),
		map((sCase: ICase) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: toastMessages.showLinkCopyToast });
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

