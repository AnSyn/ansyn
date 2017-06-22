import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { IFiltersState } from '../../reducer/filters.reducer';
import { Observable } from 'rxjs/Observable';
import { FilterMetadata } from './../../models/metadata/filter-metadata.interface';
import { Filter } from './../../models/filter';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
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
    ])
  ]
})
export class FilterContainerComponent implements OnInit {

  @Input() filter: Filter;
  
  @ViewChild('fields') fields: ElementRef;
  @ViewChild('downArrow') downArrow: ElementRef;

  private _show = true;
  private _isAnimatig = false;
  
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

  set show(value) {
    this._show = value;
    this.setFieldsStyle(value);
  }

  get show() {
    return this._show;
  }

  get disabledButton() {
    return !this.metadataFromState || this._isAnimatig;
  }

  ngOnInit() {
    Observable.fromEvent(this.fields.nativeElement, 'transitionend').subscribe(() => {
      this.setCurrentHeightFields();
    });
  }

  setCurrentHeightFields() {
    this.fields.nativeElement.style.transition = '0';
    this.fields.nativeElement.style.maxHeight = `${this.fields.nativeElement.offsetHeight}px`;
    this._isAnimatig = false;
  }

  setFieldsStyle(show: boolean) {
    const fieldsStyle = this.fields.nativeElement.style;
    fieldsStyle.transition = '0.5s';
    this._isAnimatig = true;
    if (show) {
      fieldsStyle.maxHeight = '1000px';
    } else {
      fieldsStyle.maxHeight = '0';
    }
  }
}
