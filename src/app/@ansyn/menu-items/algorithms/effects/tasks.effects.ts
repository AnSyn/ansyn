import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { ITasksState, selectCurrentAlgorithmTask, selectTaskTotal } from '../reducers/tasks.reducer';
import { ErrorHandlerService } from '@ansyn/core';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TasksService } from '../services/tasks.service';
import {
	AddTaskAction,
	AddTasksAction,
	DeleteTaskAction,
	LoadTasksFinishedAction,
	RunTaskAction,
	RunTaskFinishedAction,
	SelectTaskAction,
	TasksActionTypes
} from '../actions/tasks.actions';
import { AlgorithmTask, AlgorithmTaskStatus } from '../models/tasks.model';
import { TasksRemoteService } from '../services/tasks-remote.service';

@Injectable()
export class TasksEffects {

	@Effect()
	loadTasks$: Observable<LoadTasksFinishedAction> = this.actions$.pipe(
		ofType(TasksActionTypes.LOAD_TASKS),
		withLatestFrom(this.store.select(selectTaskTotal), (action, total) => total),
		switchMap((total: number) => {
			return this.tasksService.loadTasks(total).pipe(
				map(tasks => new LoadTasksFinishedAction(tasks))
			);
		})
	);

	@Effect()
	onLoadTasksFinished$: Observable<AddTasksAction> = this.actions$.pipe(
		ofType(TasksActionTypes.LOAD_TASKS_FINISHED),
		map(({ payload }: LoadTasksFinishedAction) => new AddTasksAction(payload))
	);

	@Effect()
	onRunTask$: Observable<RunTaskFinishedAction> = this.actions$.pipe(
		ofType<RunTaskAction>(TasksActionTypes.RUN_TASK),
		withLatestFrom(this.store.select(selectCurrentAlgorithmTask)),
		switchMap(([action, task]: [TasksActionTypes, AlgorithmTask]) => (
			this.tasksRemoteService.runTask(task).pipe(
				map(() => new RunTaskFinishedAction(task))
			)
		))
	);

	@Effect()
	onRunTaskFinished$: Observable<AddTaskAction> = this.actions$.pipe(
		ofType<RunTaskFinishedAction>(TasksActionTypes.RUN_TASK_FINISHED),
		map(({ payload }: RunTaskFinishedAction) => payload),
		map((task: AlgorithmTask) => {
			task.runTime = new Date();
			task.status = AlgorithmTaskStatus.SENT;
			return new AddTaskAction(task);
		})
	);

	@Effect()
	onAddTask$: Observable<SelectTaskAction> = this.actions$.pipe(
		ofType<AddTaskAction>(TasksActionTypes.ADD_TASK),
		switchMap((action: AddTaskAction) => this.tasksService.createTask(action.payload)),
		map((task: AlgorithmTask) => {
			return new SelectTaskAction(task.id)
		})
	);

	@Effect()
	onDeleteTask$: Observable<SelectTaskAction> = this.actions$.pipe(
		ofType<DeleteTaskAction>(TasksActionTypes.DELETE_TASK),
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

