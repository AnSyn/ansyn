import { Inject, Injectable } from '@angular/core';
import { IdahoSourceProvider } from './idaho-source-provider';
import { ErrorHandlerService, LoggerService, Overlay } from '@ansyn/core';
import { HttpClient } from '@angular/common/http';
import { IdahoOverlaysSourceConfig, IIdahoOverlaySourceConfig } from '@ansyn/ansyn/app-providers/overlay-source-providers/idaho-source-provider';

export const IdahoOverlaySourceType2 = 'IDAHO2';

@Injectable()
export class IdahoSourceProvider2 extends IdahoSourceProvider {
	sourceType = IdahoOverlaySourceType2;
	constructor(public errorHandlerService: ErrorHandlerService, protected http: HttpClient, @Inject(IdahoOverlaysSourceConfig) protected _overlaySourceConfig: IIdahoOverlaySourceConfig, protected loggerService: LoggerService) {
		super(errorHandlerService, http, _overlaySourceConfig, loggerService)
	}
	protected parseData(idahoElement: any, token: string): Overlay {
		const result = super.parseData(idahoElement, token);
		result.isGeoRegistered = false;
		return result;
	}
}
