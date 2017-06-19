import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterContainerComponent } from './filter-container.component';

describe('FilterContainerComponent', () => {
  let component: FilterContainerComponent;
  let fixture: ComponentFixture<FilterContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
