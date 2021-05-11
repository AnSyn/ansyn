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
	baseUrl: string;
	landingPageUrl: string;
	menuItems?: string[];
	isCollapsible?: boolean;
	environment: string;
	isSwitchEnvironmentChecked?: boolean;
}
