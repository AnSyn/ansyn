import { Injectable } from '@angular/core';
import { IdahoSourceProvider } from './idaho-source-provider';
import { Overlay } from '@ansyn/core';

export const IdahoOverlaySourceType2 = 'IDAHO2';

@Injectable()
export class IdahoSourceProvider2 extends IdahoSourceProvider {
	sourceType = IdahoOverlaySourceType2;

	protected parseData(idahoElement: any, token: string): Overlay {
		const result = super.parseData(idahoElement, token);
		result.isGeoRegistered = false;
		return result;
	}
}
