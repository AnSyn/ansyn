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
	DeleteTaskAction,
	RunTaskAction,
	SelectTaskAction
} from '../actions/tasks.actions';
import { AlgorithmTask } from '../models/tasks.model';
import { mergeMap } from 'rxjs/internal/operators';
import { TasksRemoteService } from '../services/tasks-remote.service';

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
	onRunTask$: Observable<AddTaskAction> = this.actions$.pipe(
		ofType<RunTaskAction>(AlgorithmsActionTypes.RUN_TASK),
		mergeMap((action: RunTaskAction) => (
			this.tasksRemoteService.runTask(action.payload).pipe(
				map(() => action)
			)
		)),
		map((action: RunTaskAction) => {
				const task: AlgorithmTask = action.payload;
				task.runTime = new Date();
				task.status = 'Sent';
				return new AddTaskAction(task);
			}
		)
	);

	@Effect()
	onAddTask$: Observable<SelectTaskAction> = this.actions$.pipe(
		ofType<AddTaskAction>(AlgorithmsActionTypes.ADD_TASK),
		switchMap((action: AddTaskAction) => this.tasksService.createTask(action.payload)),
		map((task: AlgorithmTask) => {
			return new SelectTaskAction(task)
		})
	);

	@Effect()
	onDeleteTask$: Observable<SelectTaskAction> = this.actions$.pipe(
		ofType<DeleteTaskAction>(AlgorithmsActionTypes.DELETE_TASK),
		switchMap((action: DeleteTaskAction) => this.tasksService.removeTask(action.payload)),
		map(() => new SelectTaskAction(null))
	);

	constructor(
		protected actions$: Actions,
		protected tasksService: TasksService,
		protected tasksRemoteService: TasksRemoteService,
		protected store: Store<ITasksState>,
		protected errorHandlerService: ErrorHandlerService
	) {
	}
}

