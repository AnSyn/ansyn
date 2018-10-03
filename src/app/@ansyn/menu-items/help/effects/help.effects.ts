import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Dictionary } from '@ngrx/entity/src/models';
import { getMenuSessionData, IMenuItem, IMenuState, selectEntitiesMenuItems, SelectMenuItemAction } from '@ansyn/menu';
import { filter, map } from 'rxjs/operators';
import { HelpLocalStorageService } from '../services/help.local-storage.service';

@Injectable()
export class HelpEffects {

	@Effect()
	checkHelpMenuOnStartup$: Observable<Action> = this.menuStore$.select(selectEntitiesMenuItems)
		.pipe(
			filter((menuEntities: Dictionary<IMenuItem>) => Boolean(menuEntities['Help'])),
			filter(() => !getMenuSessionData() && !this.helpLocalStorageService.getHelpLocalStorageData().dontShowHelpOnStartup),
			map(() => new SelectMenuItemAction('Help'))
		);

	constructor(protected helpLocalStorageService: HelpLocalStorageService,
				protected menuStore$: Store<IMenuState>
	) {
	}

}

