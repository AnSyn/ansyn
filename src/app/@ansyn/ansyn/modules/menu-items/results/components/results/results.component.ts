import { Component, OnInit } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';

@Component({
	selector: 'ansyn-results',
	templateUrl: './results.component.html',
	styleUrls: ['./results.component.less'],
	animations: [
		trigger('expand', [
			transition(':enter', [
				style({ transform: 'translateY(100%)' }),
				animate('1.25s ease-in-out', style({ transform: 'translateY(0%)' }))
			])
		])
	]
})
export class ResultsComponent implements OnInit {

	constructor() {
	}

	ngOnInit() {
	}

	onExpandStart() {
		const resultsTableElement = document.querySelector('.results');
		if (resultsTableElement) {
			resultsTableElement.setAttribute('style', `z-index: 5`);
		}
	}
}
