import { Component, ViewChild, ElementRef, trigger, transition, style, animate, OnInit} from '@angular/core';
import { Case, CasesService } from "@ansyn/core";
import {DeleteCaseComponent} from "../delete-case/delete-case.component";
import {EditCaseComponent} from "../edit-case/edit-case.component";

const animations = [
  trigger("leaveAnim", [
    transition(":leave", [style({boxShadow: 'inset 382px 0 0 0 rgb(206, 120, 128)'}), animate("0.3s", style({boxShadow: 'inset 0px 0px 0px 0px rgb(206, 120, 128)', color: 'white'}))]),
  ])
];

@Component({
  selector: 'ansyn-cases-table',
  templateUrl: './cases-table.component.html',
  styleUrls: ['./cases-table.component.scss'],
  animations
})
export class CasesTableComponent implements OnInit{
  @ViewChild("tbody_element") tbody_element: ElementRef;

  constructor(private casesService:CasesService) {
    this.casesService.caseAdded.subscribe(this.onCasesAdded.bind(this));
  }

  ngOnInit(): void {

  }

  get cases(): Case[] {
    return this.casesService.cases;
  }

  loadCases(): void {
    this.casesService.loadCases();
  }

  onCasesAdded(selected_case: Case) {
    this.selectCase(selected_case);
    this.tbody_element.nativeElement.scrollTop = 0;
  }

  calcTopCaseMenu($event:MouseEvent, case_menu: HTMLDivElement) {
    let target:HTMLElement = <any> $event.target;
    let offsetTop = target.offsetTop;
    let scrollTop = target.parentElement.scrollTop;
    case_menu.style.top = `${offsetTop - scrollTop}px`;
  }

  removeCase($event: MouseEvent, selected_case_id: string): void {
    $event.stopPropagation();
    this.casesService.modal.showModal(DeleteCaseComponent, selected_case_id);
  }

  editCase($event: MouseEvent, selected_case_id: string){
    $event.stopPropagation();
    this.casesService.modal.showModal(EditCaseComponent, selected_case_id);
  }

  selectCase(selected_case: Case): void {
    this.casesService.selectCase(selected_case);
  }

}
