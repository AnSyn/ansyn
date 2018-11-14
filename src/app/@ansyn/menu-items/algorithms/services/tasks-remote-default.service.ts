import { Injectable } from '@angular/core';
import { TasksRemoteService } from './tasks-remote.service';
import { AlgorithmTask } from '../models/tasks.model';

@Injectable()
export class TasksRemoteDefaultService implements TasksRemoteService {

	constructor() {
	}

	runTask(task: AlgorithmTask) {
		console.log('running task', task);
	}
}
