import { Observable } from "rxjs/Observable";
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { FiltersConfig } from '../models/filters-config';
import { Filter } from '../models/filter';

import 'rxjs/add/operator/of';

export const filtersConfig: InjectionToken<FiltersConfig> = new InjectionToken('filtersConfig');

@Injectable()
export class FiltersService {
  constructor(@Inject(filtersConfig) private config: FiltersConfig) { }

  loadFilters(): Observable<Filter[]> {
    return Observable.of(this.config.filters);
  }

}
