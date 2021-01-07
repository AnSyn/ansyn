export interface IMenuItem {
	name: string;
	component: any;
	iconClass: string;
	badge?: string;
	production?: boolean;
	dockedToBottom?: boolean;
	triggerClass: string;
}
