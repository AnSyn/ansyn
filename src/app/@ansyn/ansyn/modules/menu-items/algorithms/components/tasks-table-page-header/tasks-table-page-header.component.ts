import { Component, OnInit } from '@angular/core';
import { ITasksState } from '../../reducers/tasks.reducer';
import { Store } from '@ngrx/store';
import { SelectTaskAction, SetTasksPageToShow } from '../../actions/tasks.actions';
import { TasksPageToShow } from '../../models/tasks.model';

@Component({
	selector: 'ansyn-tasks-table-page-header',
	templateUrl: './tasks-table-page-header.component.html',
	styleUrls: ['./tasks-table-page-header.component.less']
})
export class TasksTablePageHeaderComponent implements OnInit {

	constructor(protected store$: Store<ITasksState>) {
	}

	ngOnInit() {
	}

	onNewTask() {
		this.store$.dispatch(SelectTaskAction(null));
		this.store$.dispatch(SetTasksPageToShow({payload: TasksPageToShow.TASK_FORM}));
	}

}
