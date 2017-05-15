import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesComponent } from './cases.component';
import { CasesService } from '../../services/cases.service';
import { MockComponent } from '@ansyn/core/test';


let a = MockComponent({selector: "ansyn-cases-tools"});
let b = MockComponent({selector: "ansyn-cases-table"});
let c = MockComponent({selector: "ansyn-cases-modal-container"});


describe('CasesComponent', () => {
  let component: CasesComponent;
  let fixture: ComponentFixture<CasesComponent>;
  let casesService: CasesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CasesComponent, a, b, c]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
