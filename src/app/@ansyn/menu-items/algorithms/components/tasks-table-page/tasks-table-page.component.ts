import { Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'ansyn-tasks-table-page',
	templateUrl: './tasks-table-page.component.html',
	styleUrls: ['./tasks-table-page.component.less']
})
export class TasksTablePageComponent {
	@Output() goto = new EventEmitter<string>();

	constructor() {
	}

}
