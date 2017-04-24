import { Component } from '@angular/core';
import { CasesService, CaseModalService } from "@ansyn/core";
import { EditCaseComponent } from "../edit-case/edit-case.component";

@Component({
  selector: 'ansyn-cases-tools',
  templateUrl: './cases-tools.component.html',
  styleUrls: ['./cases-tools.component.scss']
})
export class CasesToolsComponent {

  constructor(private caseModalService: CaseModalService) { }

  showCaseModal(): void {
    this.caseModalService.showModal(EditCaseComponent)
  }

}
