import { Component, OnInit } from '@angular/core';
import { AlgorithmsService } from '../../services/algorithms.service';
import { TranslateService } from '@ngx-translate/core';

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
	algNames: string[] = [];
	overlays = ['a', 'b', 'c'];
	errorMsg: string;

	get algorithms() {
		return this.algorithmsService.config;
	}

	get currentAlgorithm() {
		return this.algorithms[this.algName];
	}

	get timeEstimation() {
		return this.currentAlgorithm.timeEstimationPerOverlayInMinutes * this.overlays.length;
	}

	constructor(
		protected algorithmsService: AlgorithmsService,
		public translate: TranslateService
	) {
	}

	ngOnInit() {
		this.clearError();
		console.log(this.algorithms);
		this.algNames = Object.keys(this.algorithms);
	}

	clearError() {
		this.errorMsg = '';
	}

	showError(msg: string) {
		this.errorMsg = msg;
	}

	hasError(): boolean {
		return Boolean(this.errorMsg);
	}

	onSubmit() {
	}

}
