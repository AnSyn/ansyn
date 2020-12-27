import { Component, HostBinding, OnInit } from '@angular/core';
import { ITasksState } from '../../reducers/tasks.reducer';
import { Store } from '@ngrx/store';
import { SetTasksPageToShow } from '../../actions/tasks.actions';
import { TasksPageToShow } from '../../models/tasks.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ansyn-tasks-form-page-header',
	templateUrl: './tasks-form-page-header.component.html',
	styleUrls: ['./tasks-form-page-header.component.less']
})
export class TasksFormPageHeaderComponent implements OnInit {

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(
		protected store$: Store<ITasksState>,
		protected translateService: TranslateService
	) {
	}

	ngOnInit() {
	}

	backToTable() {
		this.store$.dispatch(new SetTasksPageToShow(TasksPageToShow.TASKS_TABLE));
	}

}
