import { Component, Inject } from '@angular/core';
import { HelpLocalStorageService } from '../services/help.local-storage.service';

export const helpConfig = 'helpConfig';

export interface IHelpConfig {
	landingPageUrl: string;
}

@Component({
	selector: 'ansyn-help',
	templateUrl: './help.component.html',
	styleUrls: ['./help.component.less']
})
export class HelpComponent {

	constructor(public helpLocalStorageService: HelpLocalStorageService, @Inject(helpConfig) private helpConfig: IHelpConfig ) {
		window.open(helpConfig.landingPageUrl);
	}
}
