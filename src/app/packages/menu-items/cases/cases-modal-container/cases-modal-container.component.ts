import { Component, OnInit, trigger, transition, style, animate, ViewChild, ViewContainerRef } from '@angular/core';
import { AnimationEntryMetadata } from "@angular/core/src/animation/metadata";
import { CaseModalService } from "@ansyn/core";
import { ComponentFactoryResolver } from "@angular/core";

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
  selected_component_ref;

  constructor(public caseModalService: CaseModalService, private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.caseModalService.onShow.subscribe(this.buildTemplate.bind(this));
    this.caseModalService.onClose.subscribe(this.destroyTemplate.bind(this));
  }

  buildTemplate($event: {component: any}) {

    let factory = this.componentFactoryResolver.resolveComponentFactory($event.component);
    this.selected_component_ref = this.modal_content.createComponent(factory);
  }

  destroyTemplate() {
    if(this.selected_component_ref) {
      this.selected_component_ref.destroy();
      this.selected_component_ref = null;
    }
  }

}
