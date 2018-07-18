import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsCollectionComponent } from './annotations-collection.component';

describe('AnnotationsCollectionComponent', () => {
  let component: AnnotationsCollectionComponent;
  let fixture: ComponentFixture<AnnotationsCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationsCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationsCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
