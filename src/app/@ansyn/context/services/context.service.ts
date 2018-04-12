import { Inject, Injectable } from '@angular/core';
import { ContextConfig } from '../models/context.config';
import { IContextConfig } from '../models/context.config.model';
import { Observable } from 'rxjs/Observable';
import { ErrorHandlerService } from '@ansyn/core';
import { StorageService } from '@ansyn/core/services/storage/storage.service';

@Injectable()
export class ContextService {

	constructor(@Inject(ContextConfig) public config: IContextConfig,
				public storageService: StorageService,
				public errorHandlerService: ErrorHandlerService) {
	}

	loadContexts(): Observable<any> {
		return this.storageService.getPage(this.config.schema, 0, 100)
			.catch(err => this.errorHandlerService.httpErrorHandle(err));
	}
}
