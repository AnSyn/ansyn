import { Inject, Injectable } from '@angular/core';
import {
	AlgorithmsConfig,
	AlgorithmTask,
	AlgorithmTaskPreview,
	IAlgorithmsConfig,
	IAlgorithmsTaskState
} from '../models/algorithms.model';
import { Observable } from 'rxjs/index';
import { catchError, map } from 'rxjs/operators';
import {
	ErrorHandlerService,
	IStoredEntity,
	StorageService
} from '@ansyn/core';
import { UUID } from 'angular2-uuid';
import { cloneDeep } from 'lodash';

@Injectable()
export class AlgorithmsService {

	constructor(
		@Inject(AlgorithmsConfig) public config: IAlgorithmsConfig,
		protected storageService: StorageService,
		public errorHandlerService: ErrorHandlerService
	) {
	}

	loadTasks(tasksOffset: number = 0): Observable<any> {
		return this.storageService.getPage<AlgorithmTaskPreview>(this.config.schema, tasksOffset, this.config.paginationLimit)
			.pipe(
				map(previews => previews.map(preview => this.parseTaskPreview(preview))),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load tasks'))
			);
	}

	parseTaskPreview(taskPreview: AlgorithmTaskPreview): AlgorithmTaskPreview {
		return {
			...taskPreview,
			runTime: new Date(taskPreview.runTime)
		};
	}

	getPreview(taskValue: AlgorithmTask): AlgorithmTaskPreview {
		const taskPreview: AlgorithmTaskPreview = {
			id: taskValue.id,
			name: taskValue.name,
			type: taskValue.type,
			runTime: taskValue.runTime,
			status: taskValue.status
		};

		return taskPreview;
	}

	pluckIdSourceType(state: IAlgorithmsTaskState): IAlgorithmsTaskState {
		const dilutedState: any = cloneDeep(state);
		if (dilutedState) {
			if (Array.isArray(dilutedState.favoriteOverlays)) {
				dilutedState.favoriteOverlays = dilutedState.favoriteOverlays.map(overlay => ({
					id: overlay.id,
					sourceType: overlay.sourceType
				}));
			}
			if (Array.isArray(dilutedState.presetOverlays)) {
				dilutedState.presetOverlays = dilutedState.presetOverlays.map(overlay => ({
					id: overlay.id,
					sourceType: overlay.sourceType
				}));
			}

			if (Array.isArray(dilutedState.maps.data)) {
				dilutedState.maps.data.forEach((mapData: any) => {
					if (Boolean(mapData.data.overlay)) {
						mapData.data.overlay = {
							id: mapData.data.overlay.id,
							sourceType: mapData.data.overlay.sourceType
						};
					}
				});
			}
		}
		return dilutedState;
	}

	convertToStoredEntity(taskValue: AlgorithmTask): IStoredEntity<AlgorithmTaskPreview, IAlgorithmsTaskState> {
		return {
			preview: this.getPreview(taskValue),
			data: this.pluckIdSourceType(taskValue.state)
		};
	}

	createTask(selectedTask: AlgorithmTask): Observable<AlgorithmTask> {
		const currentTime = new Date();
		const uuid = UUID.UUID();
		selectedTask.id = uuid;
		selectedTask.runTime = currentTime;
		return this.storageService.create(this.config.schema, this.convertToStoredEntity(selectedTask))
			.pipe<any>(
				map(_ => selectedTask),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to create task'))
			);
	}

	removeTask(selectedTaskId: string): Observable<any> {
		return this.storageService.delete(this.config.schema, selectedTaskId).pipe(
			catchError(err => this.errorHandlerService.httpErrorHandle(err, `Task cannot be deleted`))
		);
	}

}
