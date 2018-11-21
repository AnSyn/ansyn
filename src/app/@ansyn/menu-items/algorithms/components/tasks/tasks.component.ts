import { Component } from '@angular/core';

@Component({
	selector: 'ansyn-algorithms',
	templateUrl: './tasks.component.html',
	styleUrls: ['./tasks.component.less']
})
export class TasksComponent {
	page = 'table';

	constructor() {
	}

	gotoPage(page: string): void {
		this.page = page;
	}

}
