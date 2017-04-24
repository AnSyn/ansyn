import { Injectable, EventEmitter  } from '@angular/core';
import { Case } from "../models/case.model";
import { CasesService } from "./cases.service";

@Injectable()
export class CaseModalService {

  onShow = new EventEmitter();
  onClose = new EventEmitter();
  case_id:string;

  constructor(private casesService: CasesService) {}

  showModal(component: any, _case_id?:string){
    this.closeModal();
    this.case_id = _case_id;
    this.onShow.emit({component});
  }

  closeModal() {
    this.case_id = undefined;
    this.onClose.emit();
  }

  getEmptyCase(): Case {
    return {
      name:'',
      owner:'',
      last_modified: new Date()
    };
  }

  getSelectedCase(): Case  {
    return this.casesService.cases.find(case_value => case_value.id == this.case_id) || this.getEmptyCase();
  }

  isCaseActive(selected_case: Case) {
    return selected_case.id == this.case_id;
  }
}
