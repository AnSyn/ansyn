import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesComponent } from './cases.component';
import { HttpModule } from "@angular/http/src/http_module";
import { CoreModule, CasesService, Case } from "@ansyn/core";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'ansyn-edit-case',
  template: `<h1>ansyn-edit-case</h1>`,
})
class mockEditCaseComponent {
  @Input() show;
}

describe('CasesComponent', () => {
  let component: CasesComponent;
  let fixture: ComponentFixture<CasesComponent>;
  let casesService: CasesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, CoreModule],
      declarations: [CasesComponent, mockEditCaseComponent]
    })
    .compileComponents();
  }));

  beforeEach(inject([CasesService], (_casesService:CasesService) => {
    fixture = TestBed.createComponent(CasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    casesService = _casesService;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadCases should call casesService.loadCases()', () => {
    spyOn(casesService, 'loadCases');
    component.loadCases();
    expect(casesService.loadCases).toHaveBeenCalled();
  });


  it('selectCase should get case and put case.id on selected_case_id', () => {
    let id = `fake_id_blblblblblb`;
    let fake_case: Case = {id}
    component.selectCase(fake_case);
    expect(component.selected_case_id).toEqual(id);
  });

  it('isCaseSelected should equal between case.id and selected_case_id', () => {
    let id = `fake_id_blblblblblb`;
    let fake_case: Case = {id}
    component.selected_case_id = `not!!!fake_id_blblblblblb`;
    expect(component.isCaseSelected(fake_case)).toBeFalsy();
    component.selected_case_id = id;
    expect(component.isCaseSelected(fake_case)).toBeTruthy();
  });

  it('showModal should change add_object.show to be true', () => {
    component.add_object.show = false;
    expect(component.add_object.show).toBeFalsy();
    component.showModal();
    expect(component.add_object.show).toBeTruthy();
  });

  it('onCasesAdded should call selectCase and change tbody_element scrollTop to 0', () => {
    spyOn(component, 'selectCase');
    let id = `fake_id_blblblblblb`;
    let fake_case: Case = {id};
    component.onCasesAdded(fake_case);
    expect(component.selectCase).toHaveBeenCalledWith(fake_case);
    expect(component.tbody_element.nativeElement.scrollTop).toEqual(0);
  });


});
