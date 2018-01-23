import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IdahoOverlaysSourceConfig, IdahoSourceProvider, IIdahoOverlaySourceConfig } from './idaho-source-provider';
import { ErrorHandlerService, Overlay } from '@ansyn/core';

export const IdahoOverlaySourceType2 = 'IDAHO2';

@Injectable()
export class IdahoSourceProvider2 extends IdahoSourceProvider {
	sourceType = IdahoOverlaySourceType2;

	constructor(public errorHandlerService: ErrorHandlerService, http: HttpClient, @Inject(IdahoOverlaysSourceConfig) _overlaySourceConfig: IIdahoOverlaySourceConfig) {
		super(errorHandlerService, http, _overlaySourceConfig);
	}

	protected parseData(idahoElement: any, token: string): Overlay {
		const result = super.parseData(idahoElement, token);
		result.isGeoRegistered = false;
		return result;
	}
}
