import { Injectable } from '@angular/core';
import { AnsynApi } from './ansyn-api.service';

@Injectable()
export class DynamicsAnsynModule {
	constructor(public api: AnsynApi) {
	}
}
