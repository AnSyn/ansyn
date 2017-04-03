import { Injectable } from '@angular/core';
import { Case } from "../models/case.model";
import { Http, Headers, RequestOptions, Response } from "@angular/http";
import { Observable } from "rxjs";
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

  createCase(one_case:Case): Observable<any> {
    let url:string = "http://localhost:9001/api/v1/cases";
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body:string = JSON.stringify(one_case);
    let options = new RequestOptions({ headers});
    return this.http.post (url, body, options).map((res:Response) => {
      let add_cases = res.json();
      this.cases.unshift(add_cases);
      return add_cases;
    });
  }

  getCurrentPage():number {
    return Math.floor(this.cases.length / this.LIMIT);
  }
}
