import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoComponent } from './geo.component';

describe('GeoComponent', () => {
  let component: GeoComponent;
  let fixture: ComponentFixture<GeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
