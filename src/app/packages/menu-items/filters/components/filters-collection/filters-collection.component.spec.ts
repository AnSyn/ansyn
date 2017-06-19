import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersCollectionComponent } from './filters-collection.component';

describe('FiltersCollectionComponent', () => {
  let component: FiltersCollectionComponent;
  let fixture: ComponentFixture<FiltersCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltersCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
