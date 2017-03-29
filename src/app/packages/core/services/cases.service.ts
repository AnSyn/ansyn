import { Injectable } from '@angular/core';
import {Case} from "../models/case.model";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";

@Injectable()
export class CasesService {
  LIMIT:number = 15;
  public cases:Case[] = [];

  constructor(private http:Http) { }

  loadCases() {
    return this.http.get(`http://localhost:9001/api/v1/cases/pagination/${this.getCurrentPage()}?limit=${this.LIMIT}`).map(res => res.json()).subscribe((array:Case[])=>{
      this.cases = this.cases.concat(array);
    });
  }

  createCase(one_case:Case) {
    return this.http.post(`http://localhost:9001/api/v1/cases`, {'case':one_case}).map(res => res.json()).subscribe((case_value:Case)=>{
    });
  }

  getCurrentPage():number {
    return Math.floor(this.cases.length / this.LIMIT);
  }
}
