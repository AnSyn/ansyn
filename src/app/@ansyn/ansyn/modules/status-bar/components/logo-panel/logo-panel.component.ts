import { Component, HostBinding, Inject, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { TranslateService } from '@ngx-translate/core';
import { IMenuConfig, LogHelp, MenuConfig, ResetAppAction } from '@ansyn/menu';

@Component({
	selector: 'ansyn-logo-panel',
	templateUrl: './logo-panel.component.html',
	styleUrls: ['./logo-panel.component.less']
})
export class LogoPanelComponent {
	@Input() version;

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	showCredentials = false;

	constructor(
		protected store$: Store<IStatusBarState>,
		@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
		protected translateService: TranslateService,
		@Inject(MenuConfig) public menuConfig: IMenuConfig,
		protected store: Store<any>
	) {
	}

	onHelp() {
		this.store.dispatch(new LogHelp());
		this.goToLandingPage();
	}

	goToLandingPage() {
		window.open(this.menuConfig.landingPageUrl);
	}

	toggleCredentials() {
		this.showCredentials = !this.showCredentials;
	}

	resetApp() {
		this.store.dispatch(new ResetAppAction());
	}

}
