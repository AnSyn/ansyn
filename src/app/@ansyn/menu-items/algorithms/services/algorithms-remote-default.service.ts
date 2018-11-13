import { Injectable } from '@angular/core';
import { AlgorithmsRemoteService } from './algorithms-remote.service';
import { AlgorithmTask } from '../models/algorithms.model';

@Injectable()
export class AlgorithmsRemoteDefaultService implements AlgorithmsRemoteService {

	constructor() {
	}

	runTask(task: AlgorithmTask) {
		console.log('running task', task);
	}
}
