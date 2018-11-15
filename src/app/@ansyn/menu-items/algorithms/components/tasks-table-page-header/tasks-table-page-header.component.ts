import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-tasks-table-page-header',
	templateUrl: './tasks-table-page-header.component.html',
	styleUrls: ['./tasks-table-page-header.component.less']
})
export class TasksTablePageHeaderComponent implements OnInit {
	@Output() goto = new EventEmitter<string>();

	constructor() {
	}

	ngOnInit() {
	}

}
