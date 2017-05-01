import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import { Store } from '@ngrx/store';
import { Case } from '../models/case.model';

@Injectable()
export class CasesService {
  base_url = 'http://localhost:9001/api/v1/cases';
  LIMIT:number = 15;
  cases:Case[] = [];
  selected_case_id;
  caseAdded: EventEmitter<Case> = new EventEmitter();

  constructor(private http: Http, private store$: Store<any>) {}

  loadCases(last_id: string = '-1'): Observable<any> {
    return this.http.get(`${this.base_url}/pagination/${last_id}?limit=${this.LIMIT}`).map(res => res.json())
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

    return this.http.post(url, body, options)
      // .subscribe(
      // (res:Response) => {
      // let payload: Case = res.json();
      // let type = CasesActionTypes.ADD_CASE;
      // this.store$.dispatch({type, payload});
      // });
  }

  updateCase(selected_case: Case): Observable<Case> {
    let url:string = `${this.base_url}`;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body:string = JSON.stringify(selected_case);
    let options = new RequestOptions({ headers});

    return this.http.put (url, body, options);
      // .map((res:Response) => {
      // let updated_case = res.json();
      // let old_case = this.cases.find(one_case => one_case.id === updated_case.id);
      //
      // Object.keys(old_case).forEach( (key: string) => {
      //   old_case[key] = updated_case[key]
      // });
      //
      // return old_case;
    // });
  }

  removeCase(selected_case_id:string): Observable<any>  {
    let url:string = `${this.base_url}/${selected_case_id}`;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers});

    return this.http.delete(url, options);
      // let removed_case_id = res.json().id;
      // let removed_case: Case = this.cases.find(one_case => one_case.id == removed_case_id);
      // let index_of_case: number = this.cases.indexOf(removed_case);
      // this.cases.splice(index_of_case, 1);
      //
      // if(this.cases.length < this.LIMIT) this.loadCases();
      //
      // return removed_case;

  }

  getLastId(): string{
    let last_case = this.cases[this.cases.length - 1];
    return last_case ? last_case.id : '-1';
  }

}
