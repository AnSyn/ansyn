import { Component, trigger, transition, style, animate, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AnimationEntryMetadata } from "@angular/core/src/animation/metadata";
import { CasesService, Case } from "@ansyn/core";

const animations_during = '0.2s';

const animations: AnimationEntryMetadata[] = [
  trigger('modalContent', [
    transition(":enter", [style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, 100%)'}), animate(animations_during, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}))]),
    transition(":leave", [style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}), animate(animations_during, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, 100%)'}))]),
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
  selector: 'ansyn-delete-case',
  templateUrl: './delete-case.component.html',
  styleUrls: ['./delete-case.component.scss'],
  outputs:['submitCase'],
  animations,
  host
})

export class DeleteCaseComponent implements OnInit {

  ngOnInit(): void {
    this.case_model = this.casesService.modal.getSelectedCase();
  }

  public submitCase = new EventEmitter();

  case_model:Case;

  close():void {
    this.casesService.modal.closeModal();
  }

  constructor(private casesService:CasesService) { }

  onSubmitRemove() {
    this.casesService.removeCase(this.case_model.id).subscribe(()=>{
      this.casesService.modal.closeModal();
    })
  }

}
