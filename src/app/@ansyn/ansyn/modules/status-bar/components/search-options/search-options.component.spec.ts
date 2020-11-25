import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOptinsComponent } from './search-options.component';

describe('SearchOptinsComponent', () => {
  let component: SearchOptinsComponent;
  let fixture: ComponentFixture<SearchOptinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchOptinsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchOptinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
