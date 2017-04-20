import { Component } from '@angular/core';
import { CasesService } from "@ansyn/core";
import { EditCaseComponent } from "../edit-case/edit-case.component";

@Component({
  selector: 'ansyn-cases-tools',
  templateUrl: './cases-tools.component.html',
  styleUrls: ['./cases-tools.component.scss']
})
export class CasesToolsComponent {

  constructor(private casesService:CasesService) { }

  showCaseModal(): void {
    this.casesService.modal.showModal(EditCaseComponent)
  }

}
