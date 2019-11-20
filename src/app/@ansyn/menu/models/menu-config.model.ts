export interface IForkMe {
	active: boolean;
	href?: string;
	title: string;
	image: string;
}

export interface IMenuConfig {
	path: string;
	color: string;
	mode: string;
	background: string;
	forkMe: IForkMe;
	menuItems?: string[];
	iscollapsible?: boolean;
}
