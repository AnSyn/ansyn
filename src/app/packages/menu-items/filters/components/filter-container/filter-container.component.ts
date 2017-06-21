import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { IFiltersState } from '../../reducer/filters.reducer';
import { Observable } from 'rxjs/Observable';
import { FilterMetadata } from './../../models/metadata/filter-metadata.interface';
import { Filter } from './../../models/filter';
import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'ansyn-filter-container',
  templateUrl: './filter-container.component.html',
  styleUrls: ['./filter-container.component.less'],
  animations: [
    trigger('rotateArrow', [
      state('true', style({
        transform: 'rotateZ(-45deg) translateY(35%) translateX(50%)',
      })),
      state('false', style({
        transform: 'rotateZ(135deg) translateY(-75%)',
      })),
      transition('true => false', animate('250ms ease-out')),
      transition('false => true', animate('250ms ease-out'))
    ]),
    trigger('toggleFields', [
      state('true', style({
        opacity: 1,
      })),
      state('false', style({
        opacity: 0,
        display: 'none'
      })),
      transition('true => false', animate('250ms ease-out')),
      transition('false => true', animate('250ms ease-out'))
    ])
  ]
})
export class FilterContainerComponent {

  @Input() filter: Filter;

  show: string = 'true';

  metadataFromState$: Observable<FilterMetadata> = this.store
    .select("filters")
    .map((state: IFiltersState) => state.filters.get(this.filter))
    .distinctUntilChanged(isEqual);

  metadataFromState: FilterMetadata;

  constructor(private store: Store<IFiltersState>) {
    this.metadataFromState$.subscribe((metadata: FilterMetadata) => {
      this.metadataFromState = metadata;
    });
  }

}
