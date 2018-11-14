import { Injectable } from '@angular/core';
import { AlgorithmsService } from './algorithms.service';
import { AlgorithmTask } from '../models/algorithms.model';

@Injectable()
export class AlgorithmsDefaultService implements AlgorithmsService {

	constructor() {
	}

	runTask(task: AlgorithmTask) {
		console.log('running task', task);
	}
}
