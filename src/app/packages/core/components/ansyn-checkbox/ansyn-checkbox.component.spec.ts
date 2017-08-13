import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynCheckboxComponent } from './ansyn-checkbox.component';

describe('AnsynCheckboxComponent', () => {
  let component: AnsynCheckboxComponent;
  let fixture: ComponentFixture<AnsynCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnsynCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnsynCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
