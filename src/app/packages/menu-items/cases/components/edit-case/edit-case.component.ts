import { Component, trigger, transition, style, animate, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AnimationEntryMetadata } from "@angular/core/src/animation/metadata";
import { Store } from '@ngrx/store';
import { ICasesState } from '../../reducers/cases.reducer';
import { Observable } from 'rxjs';
import { AddCaseAction, CloseModalAction, UpdateCaseAction } from '../../actions/cases.actions';
import * as _ from "lodash";
import { Case } from '../../models/case.model';

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

  active_case$: Observable <Case> = this.store.select("cases").map(this.getCloneActiveCase.bind(this));

  case_model:Case;
  context_list: string[] = ["context1", "context2", "context3"];
  selected_context: string = this.context_list[0];

  @ViewChild("name_input") name_input: ElementRef;

  @HostListener("@modalContent.done") selectText() {
    this.name_input.nativeElement.select();
  }

  constructor(private store: Store<ICasesState>) { }

  getCloneActiveCase(case_state: ICasesState): Case {
    let s_case: Case = case_state.cases.find((case_value: Case) => case_value.id == case_state.active_case_id);
    return s_case ? _.cloneDeep(s_case) : this.getEmptyCase();
  }

  getEmptyCase(): Case {
    return {
      name:'',
      owner:'',
      last_modified: new Date()
    };
  }

  ngOnInit(): void {
    this.active_case$.subscribe((active_case: Case)=>{
      this.case_model = active_case;
    });
  }

  close(): void {
    this.store.dispatch(new CloseModalAction());
  }


  onSubmitCase() {
    if(this.case_model.id) {
      this.store.dispatch(new UpdateCaseAction(this.case_model));
    } else {
      this.store.dispatch(new AddCaseAction(this.case_model));
    }

    // if(this.case_model.id) {
    //   this.casesService.updateCase(this.case_model).subscribe(this.close.bind(this));
    // } else {
    //   this.casesService.createCase(this.case_model)
    // }
  }

}
