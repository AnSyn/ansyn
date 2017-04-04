import { Component } from '@angular/core';
import { EventEmitter } from "@angular/core";
import { CasesService, Case } from "@ansyn/core";

@Component({
  selector: 'ansyn-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  inputs:['show'],
  outputs:['showChange', 'submitCase']
})

export class ContentComponent {

  public showChange = new EventEmitter();
  public submitCase = new EventEmitter();

  context_list: string[] = ["context1", "context2", "context3"];
  selected_context: string = this.context_list[0];

  case_model:Case = {
    name:'',
    owner:'',
    last_modified: new Date()
  };

  private _show;

  set show(value) {
    this._show = value;
    this.showChange.emit(value)
  }

  get show() {
    return this._show;
  }

  close():void {
    this.show = false;
  }

  constructor(private casesService:CasesService) { }

  onSubmitCase() {
    this.casesService.createCase(this.case_model).subscribe( (case_with_id:Case) => {
      this.submitCase.emit(case_with_id);
      this.show = false;
    })
  }

}
