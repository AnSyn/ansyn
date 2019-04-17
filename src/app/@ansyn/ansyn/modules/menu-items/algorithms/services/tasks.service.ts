import { Inject, Injectable } from '@angular/core';
import {
	AlgorithmsConfig,
	AlgorithmsTaskState,
	AlgorithmTask,
	AlgorithmTaskPreview,
	DilutedAlgorithmsTaskState,
	IAlgorithmsConfig
} from '../models/tasks.model';
import { combineLatest, Observable, of } from 'rxjs/index';
import { catchError, map } from 'rxjs/operators';
import { switchMap } from 'rxjs/internal/operators';
import { IOverlayByIdMetaData, OverlaysService } from '../../../overlays/services/overlays.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IStoredEntity, StorageService } from '../../../core/services/storage/storage.service';
import { IOverlay } from '../../../overlays/models/overlay.model';

@Injectable()
export class TasksService {

	constructor(
		@Inject(AlgorithmsConfig) public config: IAlgorithmsConfig,
		protected storageService: StorageService,
		public errorHandlerService: ErrorHandlerService,
		protected overlaysService: OverlaysService
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


	getEntityData(state: AlgorithmsTaskState): DilutedAlgorithmsTaskState {
		const extractDiluted = ({ id, sourceType = '' }) => ({ id, sourceType });
		return {
			region: state.region,
			overlays: state.overlays.map(extractDiluted),
			masterOverlay: extractDiluted(state.masterOverlay)
		}
	}

	convertToStoredEntity(task: AlgorithmTask): IStoredEntity<AlgorithmTaskPreview, DilutedAlgorithmsTaskState> {
		return {
			preview: this.getEntityPreview(task),
			data: this.getEntityData(task.state)
		};
	}

	createTask(selectedTask: AlgorithmTask): Observable<AlgorithmTask> {
		return this.storageService.create(this.config.schema, this.convertToStoredEntity(selectedTask))
			.pipe(
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
				switchMap((storedEntity: IStoredEntity<AlgorithmTaskPreview, DilutedAlgorithmsTaskState>) => combineLatest(
					of(storedEntity),
					this.overlaysService.getOverlaysById(<IOverlayByIdMetaData[]>storedEntity.data.overlays)
				)),
				map(([storedEntity, overlays]: [IStoredEntity<AlgorithmTaskPreview, DilutedAlgorithmsTaskState>, IOverlay[]]) => {
					const taskState: AlgorithmsTaskState = {
						region: storedEntity.data.region,
						overlays,
						masterOverlay: overlays.find(({ id }) => id === storedEntity.data.masterOverlay.id)
					};
					return this.parseTask(<AlgorithmTask>{ ...storedEntity.preview, state: taskState })
				}),
				catchError(err => this.errorHandlerService.httpErrorHandle<AlgorithmTask>(err, 'Error loading task from storage', null))
			)
	}

	parseTask(taskValue: AlgorithmTask): AlgorithmTask {
		return {
			...taskValue,
			creationTime: new Date(taskValue.creationTime),
			runTime: new Date(taskValue.runTime)
		};
	}

}
