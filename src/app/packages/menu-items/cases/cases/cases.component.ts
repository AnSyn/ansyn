import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ansyn-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['cases.component.scss']
})
export class CasesComponent implements OnInit {
  selected_case_id:number =  -1;

  case_keys:any[] = [
    {name: "Name", key:"name"},
    {name: "Owner", key:"name"},
    {name: "Last Modified", key:"last_modified"}
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

  isSelectedCase(selected_case:Case):boolean   {
   return this.selected_case_id == selected_case.id;
  }
}
