import { Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import * as rison  from 'rison';

@Injectable()
export class RouterStoreHelperService {

  constructor(private router: Router) {
  }

  queryParamsViaPath(path: string): Params {
  	return this.router.parseUrl(path).queryParams;
  }

  caseIdViaPath(path: string): string {
	  return path.split("/")[1];
  }

}
