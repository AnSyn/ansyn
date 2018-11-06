import { Component, OnInit } from '@angular/core';
import { AlgorithmsService } from '../../services/algorithms.service';

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

	constructor(protected algorithmsService: AlgorithmsService) {
	}

	ngOnInit() {
		console.log(this.algorithmsService);
	}

	onSubmit() {
	}

}
