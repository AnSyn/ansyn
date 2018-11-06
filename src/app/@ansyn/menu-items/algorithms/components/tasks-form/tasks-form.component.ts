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
	algName: string;
	whichOverlays: 'case_overlays' | 'favorite_overlays' | 'displayed_overlays' = 'favorite_overlays';
	algorithms = {};
	algNames: string[] = [];

	constructor(protected algorithmsService: AlgorithmsService) {
	}

	ngOnInit() {
		this.algorithms = this.algorithmsService.config;
		this.algNames = Object.keys(this.algorithms);
	}

	onSubmit() {
	}

}
