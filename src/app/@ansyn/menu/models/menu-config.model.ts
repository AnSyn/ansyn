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
	menuItems?: string[];
	isCollapsible?: boolean;
}

export const helpConfig = 'helpConfig';

export interface IHelpConfig {
	landingPageUrl: string;
}
