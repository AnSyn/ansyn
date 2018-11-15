import { AlgorithmTask } from '../models/algorithms.model';

export abstract class AlgorithmsService {
	abstract runTask(task: AlgorithmTask);
}
