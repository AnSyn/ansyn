export const credentialsConfig = 'credentialsConfig';

export interface ICredentialsConfig {
	active: boolean;
	userCredentialsBaseUrl: string;
	noCredentialsMessage: string;
	authorizationSiteURL: string;
	authorizationInfoURL: string;
	classificationsOfAreaBaseUrl: string;
	baseUrl: string;
	allLocation: {Name: string, Id: number}[];
}
