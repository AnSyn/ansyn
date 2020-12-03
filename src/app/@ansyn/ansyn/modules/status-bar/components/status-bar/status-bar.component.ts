import { Component, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent {

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(private translateService: TranslateService) {
	}

}
