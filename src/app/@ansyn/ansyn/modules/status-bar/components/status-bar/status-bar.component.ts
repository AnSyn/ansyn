import { Component, HostBinding, Inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { COMPONENT_MODE, ComponentVisibilityItems } from '../../../../app-providers/component-mode';
import { ComponentVisibilityService } from '../../../../app-providers/component-visibility.service';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent {
	// for component
	isSplitMapsShow: boolean;
	//
	@Input() version;

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(
		private translateService: TranslateService,
		componentVisibilityService: ComponentVisibilityService,
		@Inject(COMPONENT_MODE) public componentMode: boolean
	) {
		this.isSplitMapsShow = componentVisibilityService.get(ComponentVisibilityItems.SCREENS);
	}

}
