import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import {
	ITasksState,
	selectAlgorithmTasksAreLoaded,
	selectCurrentAlgorithmTask,
	selectTaskTotal
} from '../reducers/tasks.reducer';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { TasksService } from '../services/tasks.service';
import {
	AddTaskAction,
	AddTasksAction,
	DeleteTaskAction,
	LoadTasksFinishedAction,
	RunTaskAction,
	RunTaskFinishedAction,
	SelectTaskAction,
	SetCurrentTaskStatus,
	TasksActionTypes
} from '../actions/tasks.actions';
import { AlgorithmTask, AlgorithmTaskStatus } from '../models/tasks.model';
import { TasksRemoteService } from '../services/tasks-remote.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable()
export class TasksEffects {

	loadTasks$ = createEffect(() => this.actions$.pipe(
		ofType(LoadTasksFinishedAction),
		withLatestFrom(this.store.select(selectAlgorithmTasksAreLoaded), this.store.select(selectTaskTotal)),
		filter(([payload, loaded, total]) => !loaded),
		mergeMap(([payload, loaded, total]: [any, boolean, number]) => {
			return this.tasksService.loadTasks(total).pipe(
				map(tasks => LoadTasksFinishedAction({payload: tasks}))
			);
		}))
	);

	onLoadTasksFinished$ = createEffect(() => this.actions$.pipe(
		ofType(TasksActionTypes.LOAD_TASKS_FINISHED),
		map(payload => AddTasksAction(payload))
	));

	onRunTask$ = createEffect(() => this.actions$.pipe(
		ofType(RunTaskAction),
		withLatestFrom(this.store.select(selectCurrentAlgorithmTask)),
		mergeMap(([payload, task]: [any, AlgorithmTask]) => (
			this.tasksRemoteService.runTask(task).pipe(
				map(() => RunTaskFinishedAction(task))
			)
		)))
	);

	onRunTaskFinished$ = createEffect(() => this.actions$.pipe(
		ofType(RunTaskFinishedAction),
		mergeMap((task: AlgorithmTask) => {
			return [
				SetCurrentTaskStatus({payload: AlgorithmTaskStatus.SENT}),
				AddTaskAction({ ...task, status: AlgorithmTaskStatus.SENT, runTime: new Date() })
			];
		}))
	);

	onAddTask$ = createEffect(() => this.actions$.pipe(
		ofType(AddTaskAction),
		mergeMap(payload => this.tasksService.createTask(payload)),
		map((task: AlgorithmTask) => {
			return SelectTaskAction({payload: task.id})
		}))
	);

	onDeleteTask$ = createEffect(() => this.actions$.pipe(
		ofType(DeleteTaskAction),
		mergeMap(selectedTaskId => this.tasksService.removeTask(selectedTaskId.payload)),
		map(() => SelectTaskAction(null)))
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
