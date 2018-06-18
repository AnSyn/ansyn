import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesAutoSaveComponent } from './cases-auto-save.component';

describe('CasesAutoSaveComponent', () => {
  let component: CasesAutoSaveComponent;
  let fixture: ComponentFixture<CasesAutoSaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasesAutoSaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasesAutoSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
