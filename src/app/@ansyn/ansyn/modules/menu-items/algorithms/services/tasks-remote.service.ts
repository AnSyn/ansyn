import { AlgorithmTask } from '../models/tasks.model';
import { Observable } from 'rxjs/index';

export abstract class TasksRemoteService {
	abstract runTask(task: AlgorithmTask): Observable<any>;
}
