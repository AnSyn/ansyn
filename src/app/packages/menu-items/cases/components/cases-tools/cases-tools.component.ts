import { Component } from '@angular/core';
import { EditCaseComponent } from "../edit-case/edit-case.component";
import { ICasesState } from '../../reducers/cases.reducer';
import { Store } from '@ngrx/store';
import { OpenModalAction } from '../../actions/cases.actions';

@Component({
  selector: 'ansyn-cases-tools',
  templateUrl: './cases-tools.component.html',
  styleUrls: ['./cases-tools.component.scss']
})
export class CasesToolsComponent {

  constructor(private store: Store<ICasesState>) { }

  showCaseModal(): void {
    this.store.dispatch(new OpenModalAction({component: EditCaseComponent}));
  }

}
