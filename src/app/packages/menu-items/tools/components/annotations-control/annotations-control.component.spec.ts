import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsControlComponent } from './annotations-control.component';

describe('AnnotationsControlComponent', () => {
  let component: AnnotationsControlComponent;
  let fixture: ComponentFixture<AnnotationsControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationsControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationsControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
