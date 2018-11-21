import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ITasksState } from '../../reducers/tasks.reducer';
import { Store } from '@ngrx/store';
import { SelectTaskAction } from '../../actions/tasks.actions';

@Component({
	selector: 'ansyn-tasks-table-page-header',
	templateUrl: './tasks-table-page-header.component.html',
	styleUrls: ['./tasks-table-page-header.component.less']
})
export class TasksTablePageHeaderComponent implements OnInit {
	@Output() goto = new EventEmitter<string>();

	constructor(protected store$: Store<ITasksState>) {
	}

	ngOnInit() {
	}

	onNewTask() {
		this.store$.dispatch(new SelectTaskAction(null));
		this.goto.emit('form')
	}

}
