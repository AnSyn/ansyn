import { Component, Inject } from '@angular/core';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent {
	constructor(@Inject(COMPONENT_MODE) public componentMode: boolean) {
	}

}
