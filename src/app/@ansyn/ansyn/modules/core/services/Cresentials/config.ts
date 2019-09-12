import { Inject, Injectable } from '@angular/core';

export const CredentialsConfig = 'credentialsConfig';

export interface ICredentialsConfig {
	active: boolean;
	baseUrl: string;
	triangles: string;
}

@Injectable()
export class CredentialsConfigService {

	get config(): ICredentialsConfig {
		return this._config;
	}

	constructor(@Inject(CredentialsConfig) protected _config: ICredentialsConfig) {
	}

}
