import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasePanelComponent } from './case-panel.component';

describe('CasePanelComponent', () => {
  let component: CasePanelComponent;
  let fixture: ComponentFixture<CasePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
