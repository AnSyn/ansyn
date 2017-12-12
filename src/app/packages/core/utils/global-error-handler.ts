import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
	logger: LoggerService;
	// services cannot be injected here since this class should be invoked first
	// use inject to add service dynamically
	// see: https://medium.com/@amcdnl/global-error-handling-with-angular2-6b992bdfb59c
	constructor(private injector: Injector) {}

	handleError(error) {
		if (!this.logger) {
			this.logger = this.injector.get(LoggerService);
		}
		if (error.stack) {
			this.logger.error(error.stack);
		} else {
			this.logger.error(error.toString());
		}
		// IMPORTANT: Rethrow the error otherwise it gets swallowed
		throw error;
	}
}
