export const MENU_ITEMS_CONFIG = 'MENU_ITEMS_CONFIG';

export interface IMenuItem {
	name: string;
	component: any;
	iconClass: string;
	badge?: number;
	production?: boolean;
}
