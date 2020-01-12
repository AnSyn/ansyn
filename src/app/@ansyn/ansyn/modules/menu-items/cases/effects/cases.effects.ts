import { Inject, Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
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
	UpdateCaseBackendSuccessAction,
	LoadDefaultCaseIfNoActiveCaseAction
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
	withLatestFrom,
	tap
} from 'rxjs/operators';
import { ILayer, LayerType } from '../../layers-manager/models/layers.model';
import { UUID } from 'angular2-uuid';
import { selectLayers } from '../../layers-manager/reducers/layers.reducer';
import { DataLayersService } from '../../layers-manager/services/data-layers.service';
import { copyFromContent, SetMapsDataActionStore, SetToastMessageAction } from '@ansyn/map-facade';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IStoredEntity } from '../../../core/services/storage/storage.service';
import { rxPreventCrash } from '../../../core/utils/rxjs/operators/rxPreventCrash';
import { toastMessages } from '../../../core/models/toast-messages';
import { ICase, ICasePreview, IDilutedCaseState } from '../models/case.model';

@Injectable()
export class CasesEffects {
	loadCases$ = createEffect(() => this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_CASES),
		withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total),
		switchMap((total: number) => {
			return this.casesService.loadCases(total).pipe(
				map(cases => AddCasesAction(cases)),
				catchError(() => EMPTY)
			);
		}),
		share())
	);

	onAddCase$ = createEffect(() => this.actions$.pipe(
		ofType(SelectCaseAction),
		tap((selectedCase) => SelectCaseAction(selectedCase)),
		share())
	);

	onDeleteCase$ = createEffect(() => this.actions$.pipe(
		ofType(DeleteCaseAction),
		mergeMap((caseId) => this.dataLayersService.removeCaseLayers(caseId).pipe(map(() => action))),
		withLatestFrom(this.store.select(casesStateSelector), (action, state: ICasesState) => [state.modal.id, state.selectedCase.id]),
		filter(([modalCaseId, selectedCaseId]) => modalCaseId === selectedCaseId),
		map(() => LoadDefaultCaseAction({})),
		rxPreventCrash())
	);

	onDeleteCaseLoadCases$ = createEffect(() => this.actions$.pipe(
		ofType(CasesActionTypes.DELETE_CASE),
		withLatestFrom(this.store.select(selectCaseTotal), (action, total) => total),
		filter((total: number) => total <= this.casesService.paginationLimit),
		map(() => LoadCasesAction({cases: []})),
		share())
	);

	onUpdateCase$ = createEffect(() => this.actions$.pipe(
		ofType(UpdateCaseAction),
		filter(payload => payload.updatedCase.id !== defaultCaseId && (payload.updatedCase.autoSave || payload.forceUpdate)),
		map(payload => UpdateCaseBackendAction(payload.updatedCase)),
		share())
	);

	onUpdateCaseBackend$ = createEffect(() => this.actions$
		.pipe(
			ofType(UpdateCaseBackendAction),
			debounceTime(this.casesService.config.updateCaseDebounceTime),
			switchMap((selectedCase) => {
				return this.casesService.updateCase(selectedCase)
					.pipe(
						map((updatedCase: IStoredEntity<ICasePreview, IDilutedCaseState>) => UpdateCaseBackendSuccessAction(updatedCase)),
						catchError(() => EMPTY)
					);
			})
		)
	);

	openModal$ = createEffect(() => this.actions$.pipe(
		ofType(CasesActionTypes.OPEN_MODAL)),
		{ dispatch: false }
	);

	closeModal$ = createEffect(() => this.actions$.pipe(
		ofType(CasesActionTypes.CLOSE_MODAL)),
		{ dispatch: false }
	);

	loadDefaultCase$ = createEffect(() => this.actions$.pipe(
		ofType(LoadDefaultCaseAction),
		filter((props) => !props.payload.context),
		map((props) => {
			const defaultCaseQueryParams: ICase = this.casesService.updateCaseViaQueryParmas(props.payload, this.casesService.defaultCase);
			return SelectDilutedCaseAction(defaultCaseQueryParams);
		}),
		share())
	);

	onSaveCaseAs$ = createEffect(() => this.actions$.pipe(
		ofType(SaveCaseAsAction),
		withLatestFrom(this.store.select(selectLayers)),
		mergeMap(([payload, layers]: [ICase, ILayer[]]) => this.casesService
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
				map((addedCase: ICase) => SaveCaseAsSuccessAction(addedCase)),
				catchError(() => EMPTY)
			)
		))
	);

	onSaveCaseAsSuccess$ = createEffect(() => this.actions$.pipe(
		ofType(SaveCaseAsSuccessAction),
		concatMap(savedCase => [
			SetAutoSave(true),
			SetMapsDataActionStore({ mapsList: savedCase.state.maps.data }),
		]))
	);

	onCopyShareCaseIdLink$ = createEffect(() => this.actions$.pipe(
		ofType(CopyCaseLinkAction),
		filter(payload => !Boolean(payload.shareCaseAsQueryParams)),
		map((payload) => {
			const shareLink = this.casesService.generateLinkWithCaseId(payload.caseId);
			copyFromContent(shareLink);
			return SetToastMessageAction({ toastText: toastMessages.showLinkCopyToast });
		}))
	);

	loadDefaultCaseIfNoActiveCase$ = createEffect(() => this.actions$.pipe(
		ofType(LoadDefaultCaseIfNoActiveCaseAction),
		withLatestFrom(this.store.select(casesStateSelector)),
		filter(([action, casesState]: [Action, ICasesState]) => !Boolean(casesState.selectedCase)),
		map(() => LoadDefaultCaseAction({})))
		);

	loadCase$ = createEffect(() => this.actions$
		.pipe(
			ofType(LoadCaseAction),
			switchMap(payload => this.casesService.loadCase(payload.payload)),
			map((dilutedCase) => SelectDilutedCaseAction(dilutedCase)),
			catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load case')),
			catchError(() => of(LoadDefaultCaseAction({payload: {}})))
		)
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

	manualSave$ = createEffect(() => this.actions$.pipe(
		ofType(ManualSaveAction),
		filter((selectedCase) => selectedCase.id !== this.casesService.defaultCase.id),
		this.saveLayers,
		mergeMap(payload => [
			UpdateCaseAction({ updatedCase: payload, forceUpdate: true }),
			SetToastMessageAction({ toastText: 'Case saved successfully' })
		]),
		catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to update case')),
		catchError(() => EMPTY))
	);

	onCopyShareCaseLink$ = createEffect(() => this.actions$.pipe(
		ofType(CopyCaseLinkAction),
		filter(payload => Boolean(payload.shareCaseAsQueryParams)),
		withLatestFrom(this.store.select(casesStateSelector), (payload: { caseId: string, shareCaseAsQueryParams?: boolean }, state: ICasesState) => {
			let sCase = state.entities[payload.caseId];
			if (!sCase) {
				if (state.selectedCase.id === payload.caseId) {
					sCase = state.selectedCase;
				}
			}
			return sCase;
		}),
		map((sCase: ICase) => {
			const shareLink = this.casesService.generateQueryParamsViaCase(sCase);
			copyFromContent(shareLink);
			return SetToastMessageAction({ toastText: toastMessages.showLinkCopyToast });
		}))
	);

	constructor(protected actions$: Actions,
				protected casesService: CasesService,
				protected store: Store<ICasesState>,
				protected dataLayersService: DataLayersService,
				protected errorHandlerService: ErrorHandlerService,
				@Inject(casesConfig) public caseConfig: ICasesConfig) {
	}
}

