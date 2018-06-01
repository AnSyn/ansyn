import { Inject, Injectable } from '@angular/core';
import { IdahoSourceProvider } from './idaho-source-provider';
import { HttpClient } from '@angular/common/http';
import { IdahoOverlaysSourceConfig, IIdahoOverlaySourceConfig } from '@ansyn/ansyn/app-providers/overlay-source-providers/idaho-source-provider';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { LoggerService } from '@ansyn/core/services/logger.service';

export const IdahoOverlaySourceType2 = 'IDAHO2';

@Injectable()
export class IdahoSourceProvider2 extends IdahoSourceProvider {
	sourceType = IdahoOverlaySourceType2;
	constructor(public errorHandlerService: ErrorHandlerService, protected http: HttpClient, @Inject(IdahoOverlaysSourceConfig) protected _overlaySourceConfig: IIdahoOverlaySourceConfig, protected loggerService: LoggerService) {
		super(errorHandlerService, http, _overlaySourceConfig, loggerService)
	}
	protected parseData(idahoElement: any, token: string): Overlay {
		const result = <any> super.parseData(idahoElement, token);
		result.isGeoRegistered = false;
		return result;
	}
}
