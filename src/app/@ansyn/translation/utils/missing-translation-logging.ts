import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

export class MissingTranslationLogging implements MissingTranslationHandler {
	constructor() {

	}

	handle(params: MissingTranslationHandlerParams) {
		console.warn(`Cannot find ${params.key}`);
		return params.key;
	}
}
