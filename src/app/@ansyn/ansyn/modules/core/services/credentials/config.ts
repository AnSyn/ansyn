export const credentialsConfig = 'credentialsConfig';

export interface ICredentialsConfig {
	active: boolean;
	baseUrl: string;
	noCredentialsMessage: string;
	authorizationSiteURL: string;
	authorizationInfoURL: string;
	allLocation: string[];
}
