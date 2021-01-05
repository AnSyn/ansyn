import { Component, Inject, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';
import { LogHelp } from '../../../../../menu/actions/menu.actions';
import { Store } from '@ngrx/store';
import { IMenuConfig, IMenuState, MenuConfig } from '@ansyn/menu';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent {

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(
		private translateService: TranslateService,
		@Inject(COMPONENT_MODE) public componentMode: boolean,
		@Inject(MenuConfig) public menuConfig: IMenuConfig,
		protected store: Store<IMenuState>
	) {}


	onHelp() {
		this.store.dispatch(new LogHelp());
		this.goToLandingPage();
	}

	goToLandingPage() {
		window.open(this.menuConfig.landingPageUrl);
	}

}
