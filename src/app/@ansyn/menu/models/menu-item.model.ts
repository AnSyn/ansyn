export interface IMenuItem {
	name: string;
	component: any;
	iconClass: string;
	badge?: number;
	production?: boolean;
	isOnBottom?: boolean;
	containerClass?: string;
}
