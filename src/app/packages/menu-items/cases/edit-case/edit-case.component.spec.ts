import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { EditCaseComponent } from './edit-case.component';
import { CoreModule, CasesService, Case, CaseModalService } from "@ansyn/core";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";

describe('EditCaseComponent', () => {
  let component: EditCaseComponent;
  let fixture: ComponentFixture<EditCaseComponent>;
  let casesService: CasesService;
  let caseModalService: CaseModalService;
  let fake_case: Case = {id: 'fake_id', name: 'fake_case'};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, FormsModule, CoreModule],
      declarations: [EditCaseComponent]
    })
    .compileComponents();
  }));

  beforeEach(inject([CasesService, CaseModalService], (_casesService:CasesService, _caseModalService: CaseModalService) => {
    casesService = _casesService;
    caseModalService = _caseModalService;
    spyOn(caseModalService, 'getSelectedCase').and.callFake(() => fake_case);

    fixture = TestBed.createComponent(EditCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close should call modal.closeModal', () => {
    spyOn(caseModalService, 'closeModal');
    component.close();
    expect(caseModalService.closeModal).toHaveBeenCalled();
  });

  it('onSubmitCase should call updateCase if case_id exist and createCase if not. callBack function should call close()', () => {
    spyOn(component, 'close');
    let fake_observable = {subscribe: (callBack) => callBack()};
    spyOn(casesService, 'updateCase').and.callFake(() => fake_observable);
    spyOn(casesService, 'createCase').and.callFake(() => fake_observable);
    component.onSubmitCase();
    expect(casesService.updateCase).toHaveBeenCalled();
    expect(component.close).toHaveBeenCalled();
    component.case_model.id = undefined;

    component.onSubmitCase();
    expect(casesService.createCase).toHaveBeenCalled();
    expect(component.close).toHaveBeenCalled();
  });

  describe("template",  ()=> {
    let template :any;

    beforeEach(() => {
      template = fixture.nativeElement;
    });

    it('input name text should current case_model name', async(() => {
      let input :HTMLInputElement = template.querySelector("input[name='name']");
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(input.value).toEqual(fake_case.name);
      });
    }));
  });

});
