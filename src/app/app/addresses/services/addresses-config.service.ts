import { Inject, Injectable } from '@angular/core';
import { IAddressesConfig } from "../models/addresses.config";

export const AddressesConfig = 'addressesConfig';

@Injectable()
export class AddressesConfigService {

	get config(): IAddressesConfig {
		return this._config;
	}

	constructor(@Inject(AddressesConfig) protected _config: IAddressesConfig) {
	}

}
