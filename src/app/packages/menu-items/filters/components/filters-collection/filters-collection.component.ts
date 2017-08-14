import { FiltersService } from '../../services/filters.service';
import { Component } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Filter } from '../../models/filter';
import { Store } from '@ngrx/store';
import { IFiltersState } from '../../reducer/filters.reducer';
import {  ToggleOnlyFavoriteAction } from '../../actions/filters.actions';

@Component({
  selector: 'ansyn-filters',
  templateUrl: './filters-collection.component.html',
  styleUrls: ['./filters-collection.component.less']
})
export class FiltersCollectionComponent {

  initialFilters$: Observable<Filter[]> = this.filtersService.loadFilters();

  constructor(private filtersService: FiltersService,public store: Store<IFiltersState>) { }

  showOnlyFavorites(data){
  	this.store.dispatch(new ToggleOnlyFavoriteAction());
  }

}
