import { Component, trigger, transition, style, animate, EventEmitter } from '@angular/core';
import { AnimationEntryMetadata } from "@angular/core/src/animation/metadata";

const animations_during = '0.2s';

const animations: AnimationEntryMetadata[] = [
  trigger('blackscreen', [
    transition(":enter", [style({ opacity: 0}), animate(animations_during, style({ opacity: 1}))]),
    transition(":leave", [style({ opacity: 1}), animate(animations_during, style({ opacity: 0}))]),
  ]),
  trigger('content', [
    transition(":enter", [style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)'}), animate(animations_during, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}))]),
    transition(":leave", [style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}), animate(animations_during, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)'}))]),
  ])
];

@Component({
  selector: 'ansyn-edit-case',
  templateUrl: './edit-case.component.html',
  styleUrls: ['./edit-case.component.scss'],
  inputs:['show'],
  outputs:['showChange', 'submitCase'],
  animations
})
export class EditCaseComponent {
  public showChange = new EventEmitter();
  public submitCase = new EventEmitter();

  private _show;

  set show(value) {
    this.showChange.emit(value);
    this._show = value;
  }

  get show(){
    return this._show;
  }

}
