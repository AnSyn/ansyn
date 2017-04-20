import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { EditCaseComponent } from './edit-case.component';
import { CoreModule, CasesService, Case } from "@ansyn/core";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";

describe('EditCaseComponent', () => {
  let component: EditCaseComponent;
  let fixture: ComponentFixture<EditCaseComponent>;
  let casesService: CasesService;
  let fake_case: Case = {id: 'fake_id', name: 'fake_case'};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, FormsModule, CoreModule],
      declarations: [EditCaseComponent]
    })
    .compileComponents();
  }));

  beforeEach(inject([CasesService], (_casesService:CasesService) => {
    casesService = _casesService;
    fake_case = {id: 'fake_id', name: 'fake_case'};
    casesService.modal = <any> {getSelectedCase: () => fake_case, closeModal: () => undefined};

    fixture = TestBed.createComponent(EditCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close should call modal.closeModal', () => {
    spyOn(casesService.modal, 'closeModal');
    component.close();
    expect(casesService.modal.closeModal).toHaveBeenCalled();
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

//
//
// describe('ContentComponent', () => {
//   let component: ContentComponent;
//   let casesService: CasesService;
//   let fixture: ComponentFixture<ContentComponent>;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports:[FormsModule, CoreModule, HttpModule],
//       declarations: [ ContentComponent ]
//     })
//       .compileComponents();
//   }));
//
//   beforeEach(inject([CasesService], (_casesService:CasesService) => {
//     fixture = TestBed.createComponent(ContentComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//     casesService = _casesService;
//   }));
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   it('show setter should call showChange.emit', () => {
//     spyOn(component.showChange , 'emit');
//     component.show = true;
//     expect(component.showChange.emit).toHaveBeenCalledWith(true);
//     expect(component.show).toBeTruthy();
//   });
//
//   it('onSubmitCase should call casesService.createCase with case_model, in call back should change show to "false"', () => {
//     spyOn(component.submitCase , 'emit');
//     let fake_case_id = '12345678';
//     spyOn(casesService , 'createCase').and.callFake(
//       () =>
//         new Object( {subscribe(callback){
//           callback(fake_case_id);
//         }})
//     );
//     component.onSubmitCase();
//     expect(casesService.createCase).toHaveBeenCalledWith(component.case_model);
//     expect(component.submitCase.emit).toHaveBeenCalledWith(fake_case_id);
//     expect(component.show).toBeFalsy();
//   });
//
//
// });
