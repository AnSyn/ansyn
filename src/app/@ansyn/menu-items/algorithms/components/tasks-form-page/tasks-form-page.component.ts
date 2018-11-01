import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-tasks-form-page',
	templateUrl: './tasks-form-page.component.html',
	styleUrls: ['./tasks-form-page.component.less']
})
export class TasksFormPageComponent implements OnInit {
	@Output() goto = new EventEmitter<string>();

	constructor() {
	}

	ngOnInit() {
	}

}
