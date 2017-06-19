import { FiltersService } from '../../services/filters.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Filter } from '../../models/filter';

@Component({
  selector: 'ansyn-filters',
  templateUrl: './filters-collection.component.html',
  styleUrls: ['./filters-collection.component.less']
})
export class FiltersCollectionComponent implements OnInit {
  filters: Observable<Filter[]>;

  constructor(private filtersService: FiltersService) { }

  ngOnInit() {
    this.filters = this.filtersService.loadFilters();
  }

}
