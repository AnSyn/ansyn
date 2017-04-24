import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesModalContainerComponent } from './cases-modal-container.component';
import { HttpModule } from "../../../../../../node_modules/@angular/http/src/http_module";
import { CoreModule, CaseModalService } from "@ansyn/core";
import { EditCaseComponent } from "../edit-case/edit-case.component";
import { CasesModule } from "../cases.module";
import { DeleteCaseComponent } from "../delete-case/delete-case.component";

describe('ModalContainerComponent', () => {
  let component: CasesModalContainerComponent;
  let fixture: ComponentFixture<CasesModalContainerComponent>;
  let caseModalService: CaseModalService;

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

  beforeEach(inject([CaseModalService], (_caseModalService: CaseModalService) => {
    caseModalService = _caseModalService;
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('modal should be defined', () => {
    expect(caseModalService).toBeDefined();
  });

  it('create modal component', () => {
    caseModalService.showModal(EditCaseComponent);
    expect(fixture.nativeElement.querySelector('ansyn-edit-case')).toBeDefined();
    expect(component.selected_component_ref.instance instanceof EditCaseComponent).toBeTruthy();
    caseModalService.showModal(DeleteCaseComponent);
    expect(fixture.nativeElement.querySelector('ansyn-delete-case')).toBeDefined();
    expect(component.selected_component_ref.instance instanceof DeleteCaseComponent).toBeTruthy();

  });


});
