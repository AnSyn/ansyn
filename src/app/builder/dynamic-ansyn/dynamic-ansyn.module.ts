import { Injectable } from '@angular/core';
import { AnsynApi } from '../api/ansyn-api.service';

@Injectable()
export class DynamicsAnsynModule {

	constructor(private _api: AnsynApi) {
	}

	get api() {
		return this._api;
	}
}
