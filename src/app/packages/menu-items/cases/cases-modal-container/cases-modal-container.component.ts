import { Component, OnInit, trigger, transition, style, animate, ViewChild, ViewContainerRef } from '@angular/core';
import { AnimationEntryMetadata } from "@angular/core/src/animation/metadata";
import { CasesService, CaseModal } from "@ansyn/core";

const animations_during = '0.2s';

const animations: AnimationEntryMetadata[] = [
  trigger('blackScreen', [
    transition(":enter", [style({ opacity: 0}), animate(animations_during, style({ opacity: 1}))]),
    transition(":leave", [style({ opacity: 1}), animate(animations_during, style({ opacity: 0}))]),
  ])
];

@Component({
  selector: 'ansyn-cases-modal-container',
  templateUrl: './cases-modal-container.component.html',
  styleUrls: ['./cases-modal-container.component.scss'],
  animations
})
export class CasesModalContainerComponent implements OnInit {

  @ViewChild("modal_content", {read: ViewContainerRef}) modal_content: ViewContainerRef;

  constructor(public casesService: CasesService) {}

  ngOnInit() {
    this.casesService.modal = new CaseModal(this.casesService, this.modal_content);
  }

}
