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
      transition('true => false', animate('0.1s')),
      transition('false => true', animate('0.1s'))
    ]),
    	trigger('toggleFields', [
        transition(":enter", [style({ maxHeight: 0}), animate('0.25s', style({ maxHeight: '1000px',}))]),
        transition(":leave", [style({ maxHeight: '1000px'}), animate('0.25s', style({ maxHeight: 0}))]),
      ])
  ]
})
export class FilterContainerComponent {

  @Input() filter: Filter;

  show: boolean = true;

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
