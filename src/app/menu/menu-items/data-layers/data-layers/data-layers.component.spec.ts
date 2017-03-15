import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayersComponent } from './data-layers.component';

describe('DataLayersComponent', () => {
  let component: DataLayersComponent;
  let fixture: ComponentFixture<DataLayersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataLayersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
