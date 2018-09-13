import { Inject, Injectable } from '@angular/core';
import { ContextConfig } from '../models/context.config';
import { IContextConfig } from '../models/context.config.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';
import { ErrorHandlerService, IContext, rxPreventCrash, StorageService } from '@ansyn/core';

@Injectable()
export class ContextService {

	constructor(@Inject(ContextConfig) public config: IContextConfig,
				public storageService: StorageService,
				public errorHandlerService: ErrorHandlerService) {
	}

	loadContexts(): Observable<any> {
		return this.storageService.getPage<any>(this.config.schema, 0, 100)
			.pipe(
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'failed to load contexts')),
				rxPreventCrash()
			);
	}

	loadContext(selectedContextId: string): Observable<IContext> {
		return this.storageService.get<IContext, IContext>(this.config.schema, selectedContextId)
			.map(storedEntity =>
				this.parseContext({ ...storedEntity.preview, ...storedEntity.data }))
			.catch(err => this.errorHandlerService.httpErrorHandle(err));
	}

	private parseContext(contextValue: IContext) {
		return {
			...contextValue,
			creationTime: new Date(contextValue.creationTime)
		};
	}
}
