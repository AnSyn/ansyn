import { Injectable } from '@angular/core';
import { IFetchParams, IdahoSourceProvider } from 'ansyn';

@Injectable()
export class OverlayCustomProviderService extends IdahoSourceProvider {

  fetch(fetchParams: IFetchParams) {
    console.log('My custom fetch');
    return super.fetch(fetchParams);
  }

}
