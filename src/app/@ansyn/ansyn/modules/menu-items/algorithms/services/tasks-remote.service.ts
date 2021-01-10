import { AlgorithmTask } from '../models/tasks.model';
import { Observable } from 'rxjs';

export abstract class TasksRemoteService {
	abstract runTask(task: AlgorithmTask): Observable<any>;
}
