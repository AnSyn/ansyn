import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { CasesModalContainerComponent } from './cases-modal-container.component';
import { HttpModule } from "../../../../../../node_modules/@angular/http/src/http_module";
import { CoreModule } from "../../../core/core.module";
import { CasesService } from "../../../core/services/cases.service";
import { EditCaseComponent } from "../edit-case/edit-case.component";
import { CasesModule } from "../cases.module";
import { DeleteCaseComponent } from "../delete-case/delete-case.component";

describe('ModalContainerComponent', () => {
  let component: CasesModalContainerComponent;
  let fixture: ComponentFixture<CasesModalContainerComponent>;
  let casesService: CasesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, CoreModule, CasesModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasesModalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(inject([CasesService], (_casesService:CasesService) => {
    casesService = _casesService;
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('modal should be defined', () => {
    expect(casesService.modal).toBeDefined();
  });

  it('create modal component', () => {
    casesService.modal.showModal(EditCaseComponent);
    expect(fixture.nativeElement.querySelector('ansyn-edit-case')).toBeDefined();
    expect(casesService.modal.selected_component.instance instanceof EditCaseComponent).toBeTruthy();
    casesService.modal.showModal(DeleteCaseComponent);
    expect(fixture.nativeElement.querySelector('ansyn-delete-case')).toBeDefined();
    expect(casesService.modal.selected_component.instance instanceof DeleteCaseComponent).toBeTruthy();

  });


});
