import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesTableComponent } from './cases-table.component';
import { CasesService, Case, CaseModalService } from "@ansyn/core";
import { HttpModule } from "@angular/http";
import { CoreModule } from "@ansyn/core";
import { DeleteCaseComponent } from "../delete-case/delete-case.component";
import { EditCaseComponent } from "../edit-case/edit-case.component";

describe('CasesTableComponent', () => {
  let component: CasesTableComponent;
  let fixture: ComponentFixture<CasesTableComponent>;
  let casesService: CasesService;
  let caseModalService: CaseModalService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, CoreModule],
      declarations: [CasesTableComponent]
    })
    .compileComponents();
  }));

  beforeEach(inject([CasesService, CaseModalService], (_casesService: CasesService, _caseModalService: CaseModalService) => {
    spyOn(_casesService, 'loadCases');
    fixture = TestBed.createComponent(CasesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    casesService = _casesService;
    caseModalService = _caseModalService;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectCase should call casesService.selectCase', () => {
    spyOn(casesService, 'selectCase');
    component.selectCase("id");
    expect(casesService.selectCase).toHaveBeenCalledWith("id");
  });

  it('loadCases should call casesService.loadCases()', () => {
    component.loadCases();
    expect(casesService.loadCases).toHaveBeenCalled();
  });

  it('onCasesAdded should call selectCase and change tbody_element scrollTop to 0', () => {
    spyOn(component, 'selectCase');
    let id = `fake_id_blblblblblb`;
    let fake_case: Case = {id};
    component.onCasesAdded(fake_case);
    expect(component.selectCase).toHaveBeenCalledWith(fake_case);
    expect(component.tbody_element.nativeElement.scrollTop).toEqual(0);
  });

  it('calcTopCaseMenu should get MouseEvent calc the top and put on case_menu.style', () => {
    let case_menu: HTMLDivElement = <any> {style: {top: '-1px'}};
    let $event: MouseEvent = <any>{target: {offsetTop: 100, parentElement: {scrollTop: 50}}};
    component.calcTopCaseMenu($event, case_menu);
    expect(case_menu.style.top).toEqual('50px');
  });

  it('removeCase should call stopPropagation() and open modal with DeleteCaseComponent', () => {
    let $event: MouseEvent = <any>{stopPropagation: () => null};
    spyOn($event, 'stopPropagation');
    spyOn(caseModalService, 'showModal');
    let selected_case_id: string = 'fake_selected_case_id'
    component.removeCase($event, selected_case_id)
    expect($event.stopPropagation).toHaveBeenCalled();
    expect(caseModalService.showModal).toHaveBeenCalledWith(DeleteCaseComponent, selected_case_id);
  });

  it('editCase should call stopPropagation() and open modal with EditCaseComponent', () => {
    let $event: MouseEvent = <any>{stopPropagation: () => null};
    spyOn($event, 'stopPropagation');
    spyOn(caseModalService, 'showModal');
    let selected_case_id: string = 'fake_selected_case_id'
    component.editCase($event, selected_case_id)
    expect($event.stopPropagation).toHaveBeenCalled();
    expect(caseModalService.showModal).toHaveBeenCalledWith(EditCaseComponent, selected_case_id);
  });

});
