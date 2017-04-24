import { Injectable, EventEmitter, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Case } from "../models/case.model";
import { Http, Headers, RequestOptions, Response } from "@angular/http";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";

@Injectable()
export class CasesService {
  base_url = 'http://localhost:9001/api/v1/cases';
  LIMIT:number = 15;
  cases:Case[] = [];
  selected_case_id;
  caseAdded: EventEmitter<Case> = new EventEmitter();

  constructor(private http: Http,  public componentFactoryResolver: ComponentFactoryResolver) {}

  loadCases() {
    return this.http.get(`${this.base_url}/pagination/${this.getLastId()}?limit=${this.LIMIT}`).map(res => res.json()).subscribe((array:Case[])=>{
      this.cases = this.cases.concat(array);
    });
  }

  selectCase(selected_case: Case): void {
    this.selected_case_id = selected_case.id;
  }

  isCaseSelected(selected_case: Case): boolean {
    return this.selected_case_id == selected_case.id;
  }

  createCase(selected_case:Case): Observable<Case> {
    let url:string = `${this.base_url}`;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body:string = JSON.stringify(selected_case);
    let options = new RequestOptions({ headers});

    return this.http.post (url, body, options).map((res:Response) => {
      let added_case = res.json();
      this.cases.unshift(added_case);
      this.caseAdded.emit(added_case);
      return added_case;
    });
  }

  updateCase(selected_case:Case): Observable<Case> {
    let url:string = `${this.base_url}`;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body:string = JSON.stringify(selected_case);
    let options = new RequestOptions({ headers});

    return this.http.put (url, body, options).map((res:Response) => {
      let updated_case = res.json();
      let old_case = this.cases.find(one_case => one_case.id === updated_case.id);

      Object.keys(old_case).forEach( (key: string) => {
        old_case[key] = updated_case[key]
      });

      return old_case;
    });
  }

  removeCase(selected_case_id:string): Observable<Case>{
    let url:string = `${this.base_url}/${selected_case_id}`;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers});

    return this.http.delete(url, options).map((res:Response) => {
      let removed_case_id = res.json().id;
      let removed_case: Case = this.cases.find(one_case => one_case.id == removed_case_id);
      let index_of_case: number = this.cases.indexOf(removed_case);
      this.cases.splice(index_of_case, 1);

      if(this.cases.length < this.LIMIT) this.loadCases();

      return removed_case;
    });
  }

  getLastId(): string{
    let last_case = this.cases[this.cases.length - 1];
    return last_case ? last_case.id : '-1';
  }

}
