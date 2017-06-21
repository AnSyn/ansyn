import { FiltersService } from '../../services/filters.service';
import { Component } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Filter } from '../../models/filter';

@Component({
  selector: 'ansyn-filters',
  templateUrl: './filters-collection.component.html',
  styleUrls: ['./filters-collection.component.less']
})
export class FiltersCollectionComponent {

  initialFilters$: Observable<Filter[]> = this.filtersService.loadFilters();

  constructor(private filtersService: FiltersService) { }

}
