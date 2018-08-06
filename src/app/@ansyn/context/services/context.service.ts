import { Inject, Injectable } from '@angular/core';
import { ContextConfig } from '../models/context.config';
import { IContextConfig } from '../models/context.config.model';
import { Observable } from 'rxjs';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { IContext } from '@ansyn/core/models/context.model';
import { catchError, map } from 'rxjs/internal/operators';

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

	loadContext(selectedContextId: string): Observable<IContext> {
		return this.storageService.get<IContext, IContext>(this.config.schema, selectedContextId)
			.pipe <any> (
				map(storedEntity => this.parseContext({...storedEntity.preview, ...storedEntity.data})),
				catchError(err => this.errorHandlerService.httpErrorHandle(err))
			)

	}

	private parseContext(contextValue: IContext) {
		return {
			...contextValue,
			creationTime: new Date(contextValue.creationTime)
		};
	}
}
