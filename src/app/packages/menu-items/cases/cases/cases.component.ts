import { Component, OnInit } from '@angular/core';
import {CasesService} from "../../../core/services/cases.service";

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['cases.component.scss']
})
export class CasesComponent implements OnInit {
  i = 0;
  count = 60;
  cases = [];
  constructor(private casesService:CasesService) { }

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
