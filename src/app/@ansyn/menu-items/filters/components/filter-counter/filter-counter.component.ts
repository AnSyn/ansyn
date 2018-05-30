import { Component, Input } from '@angular/core';

@Component({
	selector: 'ansyn-filter-counter',
	templateUrl: './filter-counter.component.html',
	styleUrls: ['./filter-counter.component.less']
})
export class FilterCounterComponent {
	@Input() count = 0;
	@Input() filteredCount = 0;
}
