export interface IMenuItem {
	name: string;
	component: any;
	iconClass: string;
	badge?: number;
	production?: boolean;
	dockedToBottom?: boolean;
	showZeroBadge?: boolean;
}
