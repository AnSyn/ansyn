import { ErrorHandler, Injectable } from '@angular/core';
import { AnsynLogger } from '@ansyn/core/utils/ansyn-logger';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
	constructor() {}

	handleError(error) {
		if (error.stack) {
			AnsynLogger.activeLogger.error(error.stack);
		} else {
			AnsynLogger.activeLogger.error(error.toString());
		}
		// IMPORTANT: Rethrow the error otherwise it gets swallowed
		throw error;
	}
}
