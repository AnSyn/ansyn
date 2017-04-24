import { Component, trigger, transition, style, animate, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AnimationEntryMetadata } from "@angular/core/src/animation/metadata";
import { CasesService, Case, CaseModalService } from "@ansyn/core";
import * as _ from "lodash";

const animations_during = '0.2s';

const animations: AnimationEntryMetadata[] = [
  trigger('modalContent', [
    transition(":enter", [style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)'}), animate(animations_during, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}))]),
    transition(":leave", [style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}), animate(animations_during, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)'}))]),
  ])
];

const host = {
  "[@modalContent]": "true",
  "[style.display]": "'block'",
  "[style.position]": "'absolute'",
  "[style.width]": "'337px'",
  "[style.top]": "'15px'",
  "[style.left]": "'30px'"
};

@Component({
  selector: 'ansyn-edit-case',
  templateUrl: './edit-case.component.html',
  styleUrls: ['./edit-case.component.scss'],
  animations,
  host
})

export class EditCaseComponent implements OnInit {

  case_model:Case;
  context_list: string[] = ["context1", "context2", "context3"];
  selected_context: string = this.context_list[0];

  @ViewChild("name_input") name_input: ElementRef;

  @HostListener("@modalContent.done") selectText() {
    this.name_input.nativeElement.select();
  }

  ngOnInit(): void {
    this.case_model = _.cloneDeep(this.caseModalService.getSelectedCase());
  }

  close():void {
    this.caseModalService.closeModal();
  }

  constructor(private casesService:CasesService, private caseModalService: CaseModalService) { }

  onSubmitCase() {
    if(this.case_model.id) {
      this.casesService.updateCase(this.case_model).subscribe(this.close.bind(this));
    } else {
      this.casesService.createCase(this.case_model).subscribe(this.close.bind(this));
    }
  }

}
