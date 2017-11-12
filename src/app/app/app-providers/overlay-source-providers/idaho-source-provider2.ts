import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IdahoOverlaysSourceConfig, IdahoSourceProvider, IIdahoOverlaySourceConfig } from './idaho-source-provider';
import { IFetchParams } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { Overlay } from '@ansyn/core/models/overlay.model';

export const IdahoOverlaySourceType2 = 'IDAHO2';

@Injectable()
export class IdahoSourceProvider2 extends IdahoSourceProvider {
	sourceType = IdahoOverlaySourceType2;

	constructor(http: HttpClient, @Inject(IdahoOverlaysSourceConfig) _overlaySourceConfig: IIdahoOverlaySourceConfig) {
		super(http, _overlaySourceConfig);
	}

	public fetch(fetchParams: IFetchParams) {
		return super.fetch(fetchParams);
	}
}
