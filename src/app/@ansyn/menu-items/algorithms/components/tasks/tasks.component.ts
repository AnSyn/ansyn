import { Component } from '@angular/core';
import { ITasksState, selectAlgorithmTasksPageToShow } from '../../reducers/tasks.reducer';
import { Store } from '@ngrx/store';
import { TasksPageToShow } from '../../models/tasks.model';
import { Observable } from 'rxjs/index';

@Component({
	selector: 'ansyn-algorithms',
	templateUrl: './tasks.component.html',
	styleUrls: ['./tasks.component.less']
})
export class TasksComponent {
	page = 'table';

	pageToShow$: Observable<TasksPageToShow> = this.store$.select(selectAlgorithmTasksPageToShow);

	get TasksPageToShow() {
		return TasksPageToShow;
	}

	constructor(protected store$: Store<ITasksState>) {
	}
}
