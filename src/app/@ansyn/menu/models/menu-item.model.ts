export interface IMenuItem {
	name: string;
	component: any;
	iconClass?: string;
	badge?: string;
	production?: boolean;
	dockedToBottom?: boolean;
}

export interface IOutsideMenuItem {
	name: string;
	toggleFromBottom: boolean;
	elementRef: HTMLDivElement;
}
