import { ErrorHandler, Injectable } from '@angular/core';
import { AnsynLogger } from '@ansyn/core/utils/ansyn-logger';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
	logger = AnsynLogger.activeLogger;

	constructor() {}

	handleError(error) {
		if (error.stack) {
			this.logger.error(error.stack);
		} else {
			this.logger.error(error.toString());
		}
		// IMPORTANT: Rethrow the error otherwise it gets swallowed
		throw error;
	}
}
