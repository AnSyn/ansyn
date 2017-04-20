import { Injectable, EventEmitter, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Case } from "../models/case.model";
import { Http, Headers, RequestOptions, Response } from "@angular/http";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";

@Injectable()
export class CasesService {
  base_url = 'http://localhost:9001/api/v1';
  LIMIT:number = 15;
  cases:Case[] = [];
  selected_case_id;
  modal: CaseModal;
  caseAdded: EventEmitter<Case> = new EventEmitter();

  constructor(private http: Http,  public componentFactoryResolver: ComponentFactoryResolver) {
    this.loadCases();
  }

  loadCases() {
    return this.http.get(`http://localhost:9001/api/v1/cases/pagination/${this.getLastId()}?limit=${this.LIMIT}`).map(res => res.json()).subscribe((array:Case[])=>{
      this.cases = this.cases.concat(array);
    });
  }

  selectCase(selected_case: Case): void {
    this.selected_case_id = selected_case.id;
  }

  isCaseActive(selected_case: Case) {
    return selected_case.id == this.modal.case_id;
  }

  isCaseSelected(selected_case: Case): boolean {
    return this.selected_case_id == selected_case.id;
  }

  createCase(selected_case:Case): Observable<Case> {
    let url:string = `${this.base_url}/cases`;
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
    let url:string = "http://localhost:9001/api/v1/cases";
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
    let url:string = `http://localhost:9001/api/v1/cases/${selected_case_id}`;
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

export class CaseModal {

  private _selected_component;
  private _show:boolean;
  factory;
  case_id:string;

  constructor(private casesService:CasesService, private template: ViewContainerRef) {}

  set selected_component(value: any) {
    this._selected_component = value;
  }

  get selected_component(): any {
    return this._selected_component;
  }

  showModal(compnent_constructor, _case_id?:string){
    this.closeModal();
    this.factory  = this.casesService.componentFactoryResolver.resolveComponentFactory(compnent_constructor);
    this.selected_component = this.template.createComponent(this.factory)
    this.case_id = _case_id;
  }

  closeModal() {
    if(this.selected_component) {
      this.selected_component.destroy();
      this.selected_component = null;
    }
    this.case_id = undefined;
  }

  getEmptyCase(): Case {
    return {
      name:'',
      owner:'',
      last_modified: new Date()
    };
  }

  getSelectedCase(): Case  {
    return this.casesService.cases.find(case_value => case_value.id == this.case_id) || this.getEmptyCase();
  }

}
