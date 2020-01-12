import { Action, createAction, props } from '@ngrx/store';
import { IMenuItem } from '../models/menu-item.model';

export const MenuActionTypes = {
	INITIALIZE_MENU_ITEMS: 'INITIALIZE_MENU_ITEMS',
	ADD_MENU_ITEM: 'ADD_MENU_ITEM',
	SELECT_MENU_ITEM: 'SELECT_MENU_ITEM',
	UNSELECT_MENU_ITEM: 'UNSELECT_MENU_ITEM',
	SET_BADGE: 'SET_BADGE',
	TOGGLE_IS_PINNED: 'TOGGLE_IS_PINNED',
	TRIGGER: {
		CONTAINER_CHANGED: 'CONTAINER_CHANGED'
	},
	SET_AUTO_CLOSE: 'SET_AUTO_CLOSE',
	MENU_COLLAPSE: 'MENU_COLLAPSE',
	RESET_APP: 'RESET_APP'
};

export const ResetAppAction = createAction(
								MenuActionTypes.RESET_APP
);

export const InitializeMenuItemsAction = createAction(
											MenuActionTypes.INITIALIZE_MENU_ITEMS,
											props<{payload: IMenuItem[]}>()
);

export const AddMenuItemAction = createAction(
									MenuActionTypes.ADD_MENU_ITEM,
									props<IMenuItem>()
);

export const SelectMenuItemAction = createAction(
										MenuActionTypes.SELECT_MENU_ITEM,
										props<{payload: string}>()
);

export const UnSelectMenuItemAction = createAction(
										MenuActionTypes.UNSELECT_MENU_ITEM,
										props<{payload?: any}>()
);

export const SetBadgeAction = createAction(
								MenuActionTypes.SET_BADGE,
								props<{ key: string, badge: string }>()
);

export const ToggleIsPinnedAction = createAction(
										MenuActionTypes.TOGGLE_IS_PINNED,
										props<{payload: boolean}>()
);

export const ContainerChangedTriggerAction = createAction(
												MenuActionTypes.TRIGGER.CONTAINER_CHANGED,
												props<{payload?: any}>()
);

export const SetAutoClose = createAction(
								MenuActionTypes.SET_AUTO_CLOSE,
								props<{payload: boolean}>()
);

export const ToggleMenuCollapse = createAction(
									MenuActionTypes.MENU_COLLAPSE,
									props<{payload: boolean}>()
);
