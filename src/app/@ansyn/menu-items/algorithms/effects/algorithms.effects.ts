import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, Observable } from 'rxjs';
import { IAlgorithmState, selectTaskTotal } from '../reducers/algorithms.reducer';
import { ErrorHandlerService } from '@ansyn/core';
import { catchError, map, share, switchMap, withLatestFrom } from 'rxjs/operators';
import { AlgorithmsService } from '../services/algorithms.service';
import {
	AddAlgorithmTaskAction,
	AddAlgorithmTasksAction,
	AlgorithmsActionTypes,
	SelectAlgorithmTaskAction
} from '../actions/algorithms.actions';

@Injectable()
export class AlgorithmsEffects {

	@Effect()
	loadTasks$: Observable<AddAlgorithmTasksAction | {}> = this.actions$.pipe(
		ofType(AlgorithmsActionTypes.LOAD_TASKS),
		withLatestFrom(this.store.select(selectTaskTotal), (action, total) => total),
		switchMap((total: number) => {
			return this.tasksService.loadTasks(total).pipe(
				map(tasks => new AddAlgorithmTasksAction(tasks)),
				catchError(() => EMPTY)
			);
		}),
		share());

	@Effect()
	onAddTask$: Observable<SelectAlgorithmTaskAction> = this.actions$.pipe(
		ofType<AddAlgorithmTaskAction>(AlgorithmsActionTypes.ADD_TASK),
		map((action: AddAlgorithmTaskAction) => new SelectAlgorithmTaskAction(action.payload)),
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
		protected errorHandlerService: ErrorHandlerService
	) {
	}
}

