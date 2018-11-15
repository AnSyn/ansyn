import { Component } from '@angular/core';

@Component({
	selector: 'ansyn-algorithms',
	templateUrl: './algorithms.component.html',
	styleUrls: ['./algorithms.component.less']
})
export class AlgorithmsComponent {
	page = 'table';

	constructor() {
	}

	gotoPage(page: string): void {
		this.page = page;
	}

}
