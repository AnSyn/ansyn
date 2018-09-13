import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, UnaryFunction } from 'rxjs';
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
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { casesConfig, CasesService } from '../services/cases.service';
import { casesStateSelector, ICasesState, selectCaseTotal } from '../reducers/cases.reducer';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { ICasesConfig } from '../models/cases-config';
import {
	copyFromContent,
	ErrorHandlerService,
	ICase,
	ICasePreview,
	IDilutedCaseState,
	IStoredEntity,
	rxPreventCrash,
	SetToastMessageAction,
	toastMessages
} from '@ansyn/core';
import { catchError, debounceTime, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/internal/operators';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { ILayer, LayerType } from '../../layers-manager/models/layers.model';
import { forkJoin } from 'rxjs/index';
import { UUID } from 'angular2-uuid';
import { selectLayers } from '../../layers-manager/reducers/layers.reducer';
import { DataLayersService } from '../../layers-manager/services/data-layers.service';
import { pipe } from 'rxjs/Rx';

@Injectable()
export class CasesEffects {

	@Effect()
	loadCases$: Observable<AddCasesAction | {}> = this.actions$
		.ofType(CasesActionTypes.LOAD_CASES)
		.withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total)
		.switchMap((total: number) => {
			return this.casesService.loadCases(total)
				.map(cases => new AddCasesAction(cases))
				.catch(() => EMPTY);
		}).share();

	@Effect()
	onAddCase$: Observable<SelectCaseAction> = this.actions$
		.ofType<AddCaseAction>(CasesActionTypes.ADD_CASE)
		.map((action: AddCaseAction) => new SelectCaseAction(action.payload))
		.share();

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
	onDeleteCaseLoadCases$: Observable<LoadCasesAction> = this.actions$
		.ofType(CasesActionTypes.DELETE_CASE)
		.withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total)
		.filter((total: number) => total <= this.casesService.paginationLimit)
		.map(() => new LoadCasesAction())
		.share();

	@Effect()
	onUpdateCase$: Observable<UpdateCaseBackendAction> = this.actions$
		.ofType(CasesActionTypes.UPDATE_CASE)
		.map((action: UpdateCaseAction) => [action, this.casesService.defaultCase.id])
		.filter(([action, defaultCaseId]: [UpdateCaseAction, string]) => action.payload.updatedCase.id !== defaultCaseId && (action.payload.updatedCase.autoSave || action.payload.forceUpdate))
		.map(([action]: [UpdateCaseAction]) => new UpdateCaseBackendAction(action.payload.updatedCase))
		.share();

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
	openModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.OPEN_MODAL)
		.share();

	@Effect({ dispatch: false })
	closeModal$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.CLOSE_MODAL)
		.share();

	@Effect()
	loadDefaultCase$: Observable<SelectCaseAction> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE)
		.filter((action: LoadDefaultCaseAction) => !action.payload.context)
		.map((action: LoadDefaultCaseAction) => {
			const defaultCaseQueryParams: ICase = this.casesService.updateCaseViaQueryParmas(action.payload, this.casesService.defaultCase);
			return new SelectCaseAction(defaultCaseQueryParams);
		}).share();

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
			).catch(() => EMPTY)
		));

	@Effect()
	onCopyShareCaseIdLink$ = this.actions$
		.ofType<CopyCaseLinkAction>(CasesActionTypes.COPY_CASE_LINK)
		.filter(action => !Boolean(action.payload.shareCaseAsQueryParams))
		.map((action) => {
			const shareLink = this.casesService.generateLinkWithCaseId(action.payload.caseId);
			copyFromContent(shareLink);
			return new SetToastMessageAction({ toastText: toastMessages.showLinkCopyToast });
		});

	@Effect()
	loadDefaultCaseIfNoActiveCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE)
		.withLatestFrom(this.store.select(casesStateSelector))
		.filter(([action, casesState]: [LoadDefaultCaseAction, ICasesState]) => !Boolean(casesState.selectedCase))
		.map(() => new LoadDefaultCaseAction());

	@Effect()
	loadCase$: Observable<any> = this.actions$
		.pipe(
			ofType(CasesActionTypes.LOAD_CASE),
			switchMap((action: LoadCaseAction) => this.casesService.loadCase(action.payload)),
			catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load case')),
			catchError(() => EMPTY),
			map((dilutedCase) => new SelectDilutedCaseAction(dilutedCase))
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

