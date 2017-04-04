import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CasesService, Case } from "@ansyn/core";


@Component({
  selector: 'ansyn-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['cases.component.scss']
})

export class CasesComponent implements OnInit {
  @ViewChild("tbody_element") tbody_element: ElementRef;

  add_object = {
    show: false
  };

  selected_case_id:string =  '-1';
  case_keys:any[] = [
    {name: "Name", key:"name"},
    {name: "Owner", key:"owner"},
    {name: "Owner", key:"owner"},
  ];

  constructor(private casesService:CasesService) { }

  ngOnInit() {
    this.loadCases();
  }

  get cases():Case[]{
    return this.casesService.cases;
  }

  loadCases():void{
    this.casesService.loadCases();
  }

  selectCase(selected_case:Case):void {
    this.selected_case_id = selected_case.id;
  }

  isCaseSelected(selected_case:Case):boolean   {
  isCaseSelected(selected_case:Case):boolean   {
    return this.selected_case_id == selected_case.id;
  }

  showModal() {
    this.add_object.show = true;
  }

  onCasesAdded(selected_case:Case) {
    this.selectCase(selected_case);
    this.tbody_element.nativeElement.scrollTop = 0;
  }
