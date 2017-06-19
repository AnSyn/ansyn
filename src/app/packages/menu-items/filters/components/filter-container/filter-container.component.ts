import { Filter } from './../../models/filter';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ansyn-filter-container',
  templateUrl: './filter-container.component.html',
  styleUrls: ['./filter-container.component.less']
})
export class FilterContainerComponent implements OnInit {

  @Input() filter: Filter;
  
  constructor() { }

  ngOnInit() {
  }

}
