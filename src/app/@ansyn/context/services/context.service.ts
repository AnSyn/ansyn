import { Inject, Injectable } from '@angular/core';
import { ContextConfig } from '../models/context.config';
import { IContextConfig } from '../models/context.config.model';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core';

@Injectable()
export class ContextService {

	constructor(@Inject(ContextConfig) public config: IContextConfig,
				public httpClient: HttpClient,
				public errorHandlerService: ErrorHandlerService) {
	}

	loadContexts(): Observable<any> {
		const url = `${this.config.baseUrl}/contexts?from=0&limit=100`;
		return this.httpClient.get(url)
			.catch(err => this.errorHandlerService.httpErrorHandle(err));
	}
}
