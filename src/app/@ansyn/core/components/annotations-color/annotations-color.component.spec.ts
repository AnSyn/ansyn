import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsColorComponent } from './annotations-color.component';

describe('AnnotationsColorComponent', () => {
  let component: AnnotationsColorComponent;
  let fixture: ComponentFixture<AnnotationsColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationsColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationsColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
