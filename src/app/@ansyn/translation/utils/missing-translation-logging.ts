import { ILoggerConfig } from '../../ansyn/modules/core/models/logger-config.model';
import { LoggerService } from '../../ansyn/modules/core/services/logger.service';
import { LoggerConfig } from '../../ansyn/modules/core/models/logger.config';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { Inject } from '@angular/core';

export class MissingTranslationLogging implements MissingTranslationHandler {
	constructor(public logger: LoggerService,
				@Inject(LoggerConfig) public loggerConfig: ILoggerConfig) {

	}

	handle(params: MissingTranslationHandlerParams) {
		this.logger.warn(`Cannot find ${params.key}`);
		return params.key;
	}
}
