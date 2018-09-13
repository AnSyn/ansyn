import { Inject, Injectable } from '@angular/core';
import { IdahoOverlaysSourceConfig, IdahoSourceProvider, IIdahoOverlaySourceConfig } from './idaho-source-provider';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService, IOverlay, LoggerService } from '@ansyn/core';

export const IdahoOverlaySourceType2 = 'IDAHO2';

@Injectable()
export class IdahoSourceProvider2 extends IdahoSourceProvider {
	sourceType = IdahoOverlaySourceType2;

	constructor(public errorHandlerService: ErrorHandlerService, protected http: HttpClient, @Inject(IdahoOverlaysSourceConfig) protected _overlaySourceConfig: IIdahoOverlaySourceConfig, protected loggerService: LoggerService) {
		super(errorHandlerService, http, _overlaySourceConfig, loggerService);
	}

	protected parseData(idahoElement: any, token: string): IOverlay {
		const result = <any> super.parseData(idahoElement, token);
		result.isGeoRegistered = false;
		return result;
	}
}
