import { AlgorithmTask } from '../models/tasks.model';

export abstract class TasksRemoteService {
	abstract runTask(task: AlgorithmTask);
}
