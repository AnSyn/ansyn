import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FourViewsFilterComponent } from './four-views-filter.component';

describe('FourViewsFilterComponent', () => {
  let component: FourViewsFilterComponent;
  let fixture: ComponentFixture<FourViewsFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FourViewsFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FourViewsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
