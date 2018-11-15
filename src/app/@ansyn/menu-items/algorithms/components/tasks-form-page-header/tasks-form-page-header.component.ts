import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-tasks-form-page-header',
	templateUrl: './tasks-form-page-header.component.html',
	styleUrls: ['./tasks-form-page-header.component.less']
})
export class TasksFormPageHeaderComponent implements OnInit {
	@Output() goto = new EventEmitter<string>();

	constructor() {
	}

	ngOnInit() {
	}

}
