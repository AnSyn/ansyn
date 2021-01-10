import { Component, HostBinding, Inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent {
	@Input() version;

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(
		private translateService: TranslateService,
		@Inject(COMPONENT_MODE) public componentMode: boolean
	) {
	}

}
