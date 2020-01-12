import { Component, OnInit } from '@angular/core';
import { ITasksState } from '../../reducers/tasks.reducer';
import { Store } from '@ngrx/store';
import { SetTasksPageToShow } from '../../actions/tasks.actions';
import { TasksPageToShow } from '../../models/tasks.model';

@Component({
	selector: 'ansyn-tasks-form-page-header',
	templateUrl: './tasks-form-page-header.component.html',
	styleUrls: ['./tasks-form-page-header.component.less']
})
export class TasksFormPageHeaderComponent implements OnInit {

	constructor(protected store$: Store<ITasksState>) {
	}

	ngOnInit() {
	}

	backToTable() {
		this.store$.dispatch(SetTasksPageToShow({payload: TasksPageToShow.TASKS_TABLE}));
	}

}
