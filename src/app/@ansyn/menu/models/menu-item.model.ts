export interface IMenuItem {
	name: string;
	component: any;
	iconClass: string;
	badge?: number;
	production?: boolean;
	loader?: boolean;
	dockedToBottom?: boolean;
}
