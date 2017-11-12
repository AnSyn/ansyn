import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IdahoOverlaysSourceConfig, IdahoSourceProvider, IIdahoOverlaySourceConfig } from './idaho-source-provider';

export const IdahoOverlaySourceType2 = 'IDAHO2';

@Injectable()
export class IdahoSourceProvider2 extends IdahoSourceProvider {
	sourceType = IdahoOverlaySourceType2;

	constructor(http: HttpClient, @Inject(IdahoOverlaysSourceConfig) _overlaySourceConfig: IIdahoOverlaySourceConfig) {
		super(http, _overlaySourceConfig);
	}
}
