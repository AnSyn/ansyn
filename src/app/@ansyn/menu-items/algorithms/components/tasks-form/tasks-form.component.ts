import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-tasks-form',
	templateUrl: './tasks-form.component.html',
	styleUrls: ['./tasks-form.component.less']
})
export class TasksFormComponent implements OnInit {
	taskName: string;
	taskStatus: 'New' | 'Sent' = 'New';
	algorithm: string;
	whichOverlays: 'case_overlays' | 'favorite_overlays' | 'displayed_overlays' = 'favorite_overlays';
	algorithms = ['aaa', 'bbb', 'ccc'];

	constructor() {
	}

	ngOnInit() {
	}

}
