import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { ContentComponent } from './content.component';
import { FormsModule } from "@angular/forms";
import { CoreModule } from "@ansyn/core";
import { HttpModule } from "@angular/http";
import { CasesService } from "@ansyn/core";


describe('ContentComponent', () => {
  let component: ContentComponent;
  let casesService: CasesService;
  let fixture: ComponentFixture<ContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, CoreModule, HttpModule],
      declarations: [ContentComponent]
    })
      .compileComponents();
  }));

  beforeEach(inject([CasesService], (_casesService: CasesService) => {
    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    casesService = _casesService;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('show setter should call showChange.emit', () => {
    spyOn(component.showChange, 'emit');
    component.show = true;
    expect(component.showChange.emit).toHaveBeenCalledWith(true);
    expect(component.show).toBeTruthy();
  });

  it('onSubmitCase should call casesService.createCase with case_model, in call back should change show to "false"', () => {
    spyOn(component.submitCase, 'emit');
    let fake_case_id = '12345678';
    spyOn(casesService, 'createCase').and.callFake(
      () =>
        new Object({
          subscribe(callback) {
            callback(fake_case_id);
          }
        })
    );
    component.onSubmitCase();
    expect(casesService.createCase).toHaveBeenCalledWith(component.case_model);
    expect(component.submitCase.emit).toHaveBeenCalledWith(fake_case_id);
    expect(component.show).toBeFalsy();
  });


});
