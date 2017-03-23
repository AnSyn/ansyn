import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ansyn-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['cases.component.scss']
})
export class CasesComponent implements OnInit {
  i = 0;
  count = 60;
  cases = [];
  constructor() { }

  getData(){
    for(let index = this.i; index < this.i + this.count ; index++) {
      index++ ;
      this.cases.push(index);
    }
    this.i += this.count
  }
  ngOnInit() {
    this.getData();
  }
  ddd(){
    this.getData();
  }

}
