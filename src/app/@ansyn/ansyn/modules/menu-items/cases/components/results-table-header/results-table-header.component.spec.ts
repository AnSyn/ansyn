import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsTableHeaderComponent } from './results-table-header.component';

describe('ResultsTableHeaderComponent', () => {
  let component: ResultsTableHeaderComponent;
  let fixture: ComponentFixture<ResultsTableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultsTableHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsTableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
