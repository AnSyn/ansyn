export const Auth0Config = 'auth0Config';

export interface IAuth0Config {
	auth0Active: string;
	clientID: string;
	domain: string;
	responseType: string;
	audience: string;
	callbackURL: string;
	scope: string;

}
