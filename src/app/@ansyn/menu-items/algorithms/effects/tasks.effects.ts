import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, Observable } from 'rxjs';
import { ITasksState, selectTaskTotal } from '../reducers/tasks.reducer';
import { ErrorHandlerService } from '@ansyn/core';
import { catchError, map, share, switchMap, withLatestFrom } from 'rxjs/operators';
import { TasksService } from '../services/tasks.service';
import {
	AddTaskAction,
	AddTasksAction,
	AlgorithmsActionTypes,
	SelectTaskAction
} from '../actions/tasks.actions';

@Injectable()
export class TasksEffects {

	@Effect()
	loadTasks$: Observable<AddTasksAction | {}> = this.actions$.pipe(
		ofType(AlgorithmsActionTypes.LOAD_TASKS),
		withLatestFrom(this.store.select(selectTaskTotal), (action, total) => total),
		switchMap((total: number) => {
			return this.tasksService.loadTasks(total).pipe(
				map(tasks => new AddTasksAction(tasks)),
				catchError(() => EMPTY)
			);
		}),
		share());

	@Effect()
	onAddTask$: Observable<SelectTaskAction> = this.actions$.pipe(
		ofType<AddTaskAction>(AlgorithmsActionTypes.ADD_TASK),
		map((action: AddTaskAction) => new SelectTaskAction(action.payload)),
		share());

	@Effect({ dispatch: false })
	openModal$: Observable<any> = this.actions$
		.ofType(AlgorithmsActionTypes.OPEN_MODAL);

	@Effect({ dispatch: false })
	closeModal$: Observable<any> = this.actions$
		.ofType(AlgorithmsActionTypes.CLOSE_MODAL);

	constructor(
		protected actions$: Actions,
		protected tasksService: TasksService,
		protected store: Store<ITasksState>,
		protected errorHandlerService: ErrorHandlerService
	) {
	}
}

