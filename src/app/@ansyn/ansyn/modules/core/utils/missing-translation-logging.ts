import { ILoggerConfig } from '../models/logger-config.model';
import { LoggerService } from '../services/logger.service';
import { LoggerConfig } from '../models/logger.config';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class MissingTranslationLogging implements MissingTranslationHandler {
	constructor(public logger: LoggerService,
				@Inject(LoggerConfig) public loggerConfig: ILoggerConfig) {

	}

	handle(params: MissingTranslationHandlerParams) {
		this.logger.warn(`Can't find translation for ${ params.key }`, 'TRANSLATION');
		return params.key;
	}
}
