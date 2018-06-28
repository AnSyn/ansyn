import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/index';
import { IMenuState, selectEntitiesMenuItems } from '@ansyn/menu/reducers/menu.reducer';
import { Dictionary } from '@ngrx/entity/src/models';
import { MenuItem } from '@ansyn/menu/models/menu-item.model';
import { getMenuSessionData } from '@ansyn/menu/helpers/menu-session.helper';
import { SelectMenuItemAction } from '@ansyn/menu/actions/menu.actions';
import { filter, map } from 'rxjs/internal/operators';
import { HelpLocalStorageService } from '@ansyn/menu-items/help/services/help.local-storage.service';

@Injectable()
export class HelpEffects {

	@Effect()
	checkHelpMenuOnStartup$: Observable<Action> = this.menuStore$.select(selectEntitiesMenuItems)
		.pipe(
			filter((menuEntities: Dictionary<MenuItem>) => Boolean(menuEntities['Help'])),
			filter(() => !getMenuSessionData() && !this.helpLocalStorageService.getHelpLocalStorageData().dontShowHelpOnStartup),
			map(() => new SelectMenuItemAction('Help'))
		);

	constructor(protected helpLocalStorageService: HelpLocalStorageService,
				protected menuStore$: Store<IMenuState>
	) {
	}

}

