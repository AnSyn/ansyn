import { Inject, Injectable } from '@angular/core';
import { ContextConfig } from '../models/context.config';
import { IContextConfig } from '../models/context.config.model';
import { Observable } from 'rxjs/Observable';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';

@Injectable()
export class ContextService {

	constructor(@Inject(ContextConfig) public config: IContextConfig,
				public storageService: StorageService,
				public errorHandlerService: ErrorHandlerService) {
	}

	loadContexts(): Observable<any> {
		return this.storageService.getPage<any>(this.config.schema, 0, 100)
			.catch(err => this.errorHandlerService.httpErrorHandle(err));
	}

	loadContext(selectedContextId: string): Observable<Context> {
		return this.storageService.get<Context, Context>(this.config.schema, selectedContextId)
			.map(storedEntity =>
				this.parseContext({...storedEntity.preview, ...storedEntity.data}))
			.catch(err => this.errorHandlerService.httpErrorHandle(err));
	}

	private parseContext(contextValue: Context) {
		return {
			...contextValue,
			creationTime: new Date(contextValue.creationTime)
		};
	}
}
