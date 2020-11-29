import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ansyn-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.less']
})
export class AdvancedSearchComponent implements OnInit {

  array = ['alcson','anhaci','shit','elor','blat']
  constructor() { }

  ngOnInit(): void {
  }

  typeChanged(type) {
    //dispacth action that inform the type changed
  }

}
