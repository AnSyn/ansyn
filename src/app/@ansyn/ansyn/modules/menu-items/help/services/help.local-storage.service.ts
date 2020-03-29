import { IHelpLocalStorageState } from '../models/help.local-storage-state.model';
import { Injectable } from "@angular/core";

@Injectable()
export class HelpLocalStorageService {
	getHelpLocalStorageData(): IHelpLocalStorageState {
		const helpState: IHelpLocalStorageState = JSON.parse(localStorage.getItem('ansynHelpState'));
		return helpState ? helpState : { dontShowHelpOnStartup: false };
	}

	setHelpLocalStorageData(data: IHelpLocalStorageState) {
		const localStorageState = this.getHelpLocalStorageData();
		const updatedLocalStorageState = JSON.stringify({ ...localStorageState, ...data });
		localStorage.setItem('ansynHelpState', updatedLocalStorageState);
	}
}

