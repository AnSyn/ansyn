import { CasesActionTypes, SelectCaseByIdAction, ICasesState } from '@ansyn/menu-items/cases';
import { IMenuState } from '@ansyn/menu/reducers/menu.reducer';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Store,Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes, SelectMenuItemAction, MenuItem } from '@ansyn/core';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { IAppState } from '../';
import { isEmpty } from 'lodash';
import { RedrawTimelineAction } from '@ansyn/overlays';
import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class MenuAppEffects {

	@Effect()
	onAnimationEnd$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(MenuActionTypes.ANIMATION_END)
		.map( () => {
			return new UpdateMapSizeAction();
		});

	@Effect()
	redrawTimeline$: Observable<RedrawTimelineAction> = this.actions$
		.ofType(MenuActionTypes.ANIMATION_END)
		.map(() => {
			return new RedrawTimelineAction(true);
		});
  
	/*
	
	@Effect()
	onCaseLoaded$: Observable<SelectMenuItemAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$)
		.filter(([action, appState]: [SelectCaseByIdAction, IAppState]) => {
			const casesMenuItem: MenuItem = appState.menu.menu_items.find((item: MenuItem) => item.name === 'Cases');
			const casesIndex = appState.menu.menu_items.indexOf(casesMenuItem);
			return !((casesIndex === appState.menu.selected_menu_item_index) ||
			(appState.cases.default_case && action.payload === appState.cases.default_case.id));
		})
		.map(([action, appState]: [SelectCaseByIdAction, IAppState]) => {
			const casesMenuItem: MenuItem = appState.menu.menu_items.find((item: MenuItem) => item.name === 'Cases');
			const casesIndex = appState.menu.menu_items.indexOf(casesMenuItem);
			return new SelectMenuItemAction(casesIndex);
		});
	*/

	constructor(private actions$: Actions, private store$: Store<IAppState>) { }
}
