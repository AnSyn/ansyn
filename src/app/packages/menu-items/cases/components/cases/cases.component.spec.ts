import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesComponent } from './cases.component';
import { HttpModule } from "@angular/http/src/http_module";
import { CoreModule, CasesService, Case } from "@ansyn/core";
import { MockComponent } from "../../../../helpers/mock-component";


let a = MockComponent({selector: "ansyn-cases-tools"});
let b = MockComponent({selector: "ansyn-cases-table"});
let c = MockComponent({selector: "ansyn-cases-modal-container"});


describe('CasesComponent', () => {
  let component: CasesComponent;
  let fixture: ComponentFixture<CasesComponent>;
  let casesService: CasesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule, CoreModule],
      declarations: [CasesComponent, a, b, c]
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


});
