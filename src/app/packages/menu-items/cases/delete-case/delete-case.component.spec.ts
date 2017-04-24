import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CoreModule, CasesService, Case, CaseModalService } from "@ansyn/core";
import { DeleteCaseComponent } from './delete-case.component';
import { HttpModule } from "@angular/http";


describe('DeleteCaseComponent', () => {
  let component: DeleteCaseComponent;
  let fixture: ComponentFixture<DeleteCaseComponent>;
  let casesService: CasesService;
  let caseModalService: CaseModalService;
  let fake_case: Case = {id: 'fake_id', name: 'fake_case'};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, CoreModule],
      declarations: [ DeleteCaseComponent ]
    })
      .compileComponents();
  }));

  beforeEach(inject([CasesService, CaseModalService], (_casesService:CasesService, _caseModalService: CaseModalService) => {
    casesService = _casesService;
    caseModalService = _caseModalService;
    spyOn(caseModalService, 'getSelectedCase').and.callFake(() => fake_case);

    fixture = TestBed.createComponent(DeleteCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('text on "p" tag shuold include case name', () => {
    let p_tag = fixture.nativeElement.querySelector("p");
    expect(p_tag.innerText).toEqual(`Are you sure you want to delete ${fake_case.name}?`);

  });

  it('close should call modal.closeModal', () => {
    spyOn(caseModalService, 'closeModal');
    component.close();
    expect(caseModalService.closeModal).toHaveBeenCalled();
  });

  it('onSubmitRemove should call removeCase with callBack that call modal.closeModal', () => {
    let fake_observable = {subscribe: (callBack) => callBack()};
    spyOn(casesService, 'removeCase').and.callFake(() => fake_observable);
    spyOn(caseModalService, 'closeModal');
    component.onSubmitRemove();
    expect(casesService.removeCase).toHaveBeenCalledWith('fake_id');
    //callBack
    expect(caseModalService.closeModal).toHaveBeenCalled();
  });

});
