import { Injectable } from '@angular/core';
import { TasksRemoteService } from './tasks-remote.service';
import { AlgorithmTask } from '../models/tasks.model';
import { Observable, of } from 'rxjs/index';

@Injectable()
export class TasksRemoteDefaultService implements TasksRemoteService {

	constructor() {
	}

	runTask(task: AlgorithmTask): Observable<any> {
		console.log('running task', task);
		return of(true);
	}
}
