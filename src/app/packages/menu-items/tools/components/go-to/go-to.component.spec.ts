import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoToComponent } from './go-to.component';

describe('GoToComponent', () => {
  let component: GoToComponent;
  let fixture: ComponentFixture<GoToComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoToComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
