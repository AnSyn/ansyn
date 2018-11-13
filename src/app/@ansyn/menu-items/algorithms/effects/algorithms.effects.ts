import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, Observable } from 'rxjs';
import { IAlgorithmState, algorithmsStateSelector } from '../reducers/algorithms.reducer';
import { ErrorHandlerService, rxPreventCrash } from '@ansyn/core';
import { catchError, filter, map, mergeMap, share, switchMap, withLatestFrom } from 'rxjs/operators';
import { DataLayersService } from '../../layers-manager/services/data-layers.service';
import { AlgorithmsService } from '../services/algorithms.service';
import { AddAlgorithmTasksAction, AlgorithmsActionTypes } from '../actions/algorithms.actions';

@Injectable()
export class AlgorithmsEffects {

	@Effect()
	loadTasks$: Observable<AddAlgorithmTasksAction | {}> = this.actions$.pipe(
		ofType(AlgorithmsActionTypes.LOAD_CASES),
		withLatestFrom(this.store.select(selectTaskTotal), (action, total) => total),
		switchMap((total: number) => {
			return this.tasksService.loadTasks(total).pipe(
				map(tasks => new AddAlgorithmTasksAction(tasks)),
				catchError(() => EMPTY)
			);
		}),
		share());

	@Effect()
	onAddTask$: Observable<SelectTaskAction> = this.actions$.pipe(
		ofType<AddTaskAction>(AlgorithmsActionTypes.ADD_CASE),
		map((action: AddTaskAction) => new SelectTaskAction(action.payload)),
		share());

	@Effect()
	onDeleteTask$: Observable<any> = this.actions$.pipe(
		ofType<DeleteTaskAction>(AlgorithmsActionTypes.DELETE_CASE),
		mergeMap((action) => this.dataLayersService.removeTaskLayers(action.payload).pipe(map(() => action))),
		withLatestFrom(this.store.select(tasksStateSelector), (action, state: ITasksState) => [state.modal.id, state.selectedTask.id]),
		filter(([modalTaskId, selectedTaskId]) => modalTaskId === selectedTaskId),
		map(() => new LoadDefaultTaskAction()),
		rxPreventCrash()
	);

	@Effect()
	onDeleteTaskLoadTasks$: Observable<LoadTasksAction> = this.actions$.pipe(
		ofType(AlgorithmsActionTypes.DELETE_CASE),
		withLatestFrom(this.store.select(selectTaskTotal), (action, total) => total),
		filter((total: number) => total <= this.tasksService.paginationLimit),
		map(() => new LoadTasksAction()),
		share());

	@Effect({ dispatch: false })
	openModal$: Observable<any> = this.actions$
		.ofType(AlgorithmsActionTypes.OPEN_MODAL);

	@Effect({ dispatch: false })
	closeModal$: Observable<any> = this.actions$
		.ofType(AlgorithmsActionTypes.CLOSE_MODAL);

	constructor(
		protected actions$: Actions,
		protected tasksService: AlgorithmsService,
		protected store: Store<IAlgorithmState>,
		protected dataLayersService: DataLayersService,
		protected errorHandlerService: ErrorHandlerService
	) {
	}
}

