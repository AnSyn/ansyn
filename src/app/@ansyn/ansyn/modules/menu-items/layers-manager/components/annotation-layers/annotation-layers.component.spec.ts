import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationLayersComponent } from './annotation-layers.component';

describe('AnnotationLayersComponent', () => {
  let component: AnnotationLayersComponent;
  let fixture: ComponentFixture<AnnotationLayersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationLayersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
