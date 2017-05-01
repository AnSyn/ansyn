import { Component, trigger, transition, style, animate, EventEmitter, OnInit } from '@angular/core';
import { AnimationEntryMetadata } from "@angular/core/src/animation/metadata";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ICasesState } from '../../reducers/cases.reducer';
import { CasesActionTypes, CloseModalAction } from '../../actions/cases.actions';
import { Case } from '../../models/case.model';

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

export class DeleteCaseComponent {

  constructor(private store: Store <ICasesState>) { }

  selected_case_name$: Observable <string> = this.store.select("cases").map(this.getActiveCaseName);

  getActiveCaseName(case_state: ICasesState): string {
    let s_case: Case = case_state.cases.find( (case_value: Case) => case_value.id == case_state.active_case_id);
    return s_case ? s_case.name : '';
  }

  close():void {
    this.store.dispatch(new CloseModalAction());
  }

  onSubmitRemove() {
    this.store.dispatch({type: CasesActionTypes.DELETE_CASE});
  }

}
