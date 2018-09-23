import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ILoginConfig } from '../models/login.config';

export const LoginConfig = 'loginConfig';

@Injectable()
export class LoginConfigService {

	get config(): ILoginConfig {
		return this._config;
	}

	constructor(@Inject(LoginConfig) protected _config: ILoginConfig) {
	}

}
