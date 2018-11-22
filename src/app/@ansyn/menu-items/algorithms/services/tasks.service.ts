import { Inject, Injectable } from '@angular/core';
import {
	AlgorithmsConfig,
	AlgorithmsTaskState,
	AlgorithmTask,
	AlgorithmTaskPreview,
	IAlgorithmsConfig
} from '../models/tasks.model';
import { Observable } from 'rxjs/index';
import { catchError, map } from 'rxjs/operators';
import { ErrorHandlerService, IStoredEntity, StorageService } from '@ansyn/core';

@Injectable()
export class TasksService {

	constructor(
		@Inject(AlgorithmsConfig) public config: IAlgorithmsConfig,
		protected storageService: StorageService,
		public errorHandlerService: ErrorHandlerService
	) {
	}

	loadTasks(tasksOffset: number = 0): Observable<any[]> {
		return this.storageService.getPage<AlgorithmTaskPreview>(this.config.schema, tasksOffset, this.config.paginationLimit)
			.pipe(
				map(previews => previews.map(preview => this.parseTaskPreview(preview))),
				catchError(err => this.errorHandlerService.httpErrorHandle<any[]>(err, 'Failed to load tasks from storage', []))
			);
	}

	parseTaskPreview(taskPreview: AlgorithmTaskPreview): AlgorithmTaskPreview {
		return {
			...taskPreview,
			creationTime: new Date(taskPreview.creationTime),
			runTime: new Date(taskPreview.runTime)
		};
	}

	getEntityPreview(taskValue: AlgorithmTask): AlgorithmTaskPreview {
		const taskPreview: AlgorithmTaskPreview = {
			id: taskValue.id,
			creationTime: taskValue.creationTime,
			name: taskValue.name,
			algorithmName: taskValue.algorithmName,
			runTime: taskValue.runTime,
			status: taskValue.status
		};

		return taskPreview;
	}

	getEntityData(state: AlgorithmsTaskState): Partial<AlgorithmsTaskState> {
		return {
			region: state.region,
			overlays: []
		}
	}

	convertToStoredEntity(task: AlgorithmTask): IStoredEntity<AlgorithmTaskPreview, Partial<AlgorithmsTaskState>> {
		return {
			preview: this.getEntityPreview(task),
			data: this.getEntityData(task.state)
		};
	}

	createTask(selectedTask: AlgorithmTask): Observable<AlgorithmTask> {
		return this.storageService.create(this.config.schema, this.convertToStoredEntity(selectedTask))
			.pipe<any>(
				map(_ => selectedTask),
				catchError(err => this.errorHandlerService.httpErrorHandle<AlgorithmTask>(err, 'Failed to create task in storage', null))
			);
	}

	removeTask(selectedTaskId: string): Observable<any> {
		return this.storageService.delete(this.config.schema, selectedTaskId).pipe(
			catchError(err => this.errorHandlerService.httpErrorHandle(err, `Task cannot be deleted from storage`, null))
		);
	}

	loadTask(selectedTaskId: string): Observable<AlgorithmTask> {
		return this.storageService.get<AlgorithmTaskPreview, AlgorithmsTaskState>(this.config.schema, selectedTaskId)
			.pipe(
				map(storedEntity =>
					this.parseTask(<AlgorithmTask>{ ...storedEntity.preview, state: storedEntity.data }))
			).pipe(
				catchError(err => this.errorHandlerService.httpErrorHandle<AlgorithmTask>(err, 'Error loading task from storage', null)));
	}

	parseTask(taskValue: AlgorithmTask): AlgorithmTask {
		return {
			...taskValue,
			creationTime: new Date(taskValue.creationTime),
			runTime: new Date(taskValue.runTime)
		};
	}

}
