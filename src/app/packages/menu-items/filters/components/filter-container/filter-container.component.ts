import { UpdateFilterAction } from './../../actions/filters.actions';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { IFiltersState } from '../../reducer/filters.reducer';
import { Observable } from 'rxjs/Observable';
import { FilterMetadata } from './../../models/metadata/filter-metadata.interface';
import { Filter } from './../../models/filter';
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
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
      transition('true <=> false', animate('0.1s')),
    ]),
    trigger('fieldsTrigger', [
      state('true', style({
        maxHeight: '500px',
        opacity: 1
      })),
      state('false', style({
        maxHeight: '0',
        opacity: 0
      })),
      transition('* <=> *', animate('0.2s'))
    ])
  ]
})
export class FilterContainerComponent {

  @Input() filter: Filter;

  @ViewChild('fields') fields: ElementRef;

  private show = true;

  metadataFromState$: Observable<FilterMetadata> = this.store
    .select("filters")
    .map((state: IFiltersState) => {
      return state.filters.get(this.filter);
    })
    .distinctUntilChanged(isEqual);

  metadataFromState: FilterMetadata;

  constructor(private store: Store<IFiltersState>) {
    this.metadataFromState$.subscribe((metadata: FilterMetadata) => {
      this.metadataFromState = metadata;
    });
  }

  get disabledButton() {
    return !this.metadataFromState;
  }

  onMetadataChange(metadeata: any): void {
    this.store.dispatch(new UpdateFilterAction({ filter: this.filter, newMetadata: metadeata }));
  }

  showAll(): void {
    if (this.metadataFromState) {
      const clonedMetadata: FilterMetadata = Object.assign(Object.create(this.metadataFromState), this.metadataFromState);
      clonedMetadata.showAll();

      this.onMetadataChange(clonedMetadata);
    }
  }
}
