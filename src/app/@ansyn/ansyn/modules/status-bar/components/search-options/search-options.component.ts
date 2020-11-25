import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ansyn-search-options',
  templateUrl: './search-options.component.html',
  styleUrls: ['./search-options.component.less']
})
export class SearchOptinsComponent implements OnInit {

  isExpand: Boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  toggleSearchPannel() {
    this.isExpand = !this.isExpand;
  }

}
