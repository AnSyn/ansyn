import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingMenuComponent } from './floating-menu.component';

describe('FloatingMenuComponent', () => {
  let component: FloatingMenuComponent;
  let fixture: ComponentFixture<FloatingMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
