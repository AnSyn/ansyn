import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseLayersComponent } from './base-layers.component';

describe('BaseLayersComponent', () => {
  let component: BaseLayersComponent;
  let fixture: ComponentFixture<BaseLayersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseLayersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
