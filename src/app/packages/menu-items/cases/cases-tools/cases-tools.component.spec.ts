import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesToolsComponent } from './cases-tools.component';
import { CoreModule, CasesService } from "@ansyn/core";
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { HttpModule } from "@angular/http";

describe('CasesToolsComponent', () => {
  let component: CasesToolsComponent;
  let fixture: ComponentFixture<CasesToolsComponent>;
  let casesService: CasesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, CoreModule],
      declarations: [ CasesToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasesToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(inject([CasesService], (_casesService:CasesService) => {
    casesService = _casesService;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('add-case button should call showCaseModal()', () => {
    spyOn(component, 'showCaseModal');
    let button = fixture.nativeElement.querySelector("button.add-case");
    button.click();
    fixture.detectChanges();
    expect(component.showCaseModal).toHaveBeenCalled();
  });

  it('showCaseModal should call modal.showModal with EditCaseComponent', () => {
    casesService.modal = <any> {showModal: () => undefined};
    spyOn(casesService.modal, 'showModal');
    component.showCaseModal();
    expect(casesService.modal.showModal).toHaveBeenCalledWith(EditCaseComponent);
  });

});
