import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynComponent } from './ansyn.component';

describe('AnsynComponent', () => {
  let component: AnsynComponent;
  let fixture: ComponentFixture<AnsynComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnsynComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnsynComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
