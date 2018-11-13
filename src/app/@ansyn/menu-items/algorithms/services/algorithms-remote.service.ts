import { AlgorithmTask } from '../models/algorithms.model';

export abstract class AlgorithmsRemoteService {
	abstract runTask(task: AlgorithmTask);
}
