import { Component, Inject, Input } from '@angular/core';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent {
	@Input() version;

	constructor(
		@Inject(COMPONENT_MODE) public componentMode: boolean
	) {
	}

}
