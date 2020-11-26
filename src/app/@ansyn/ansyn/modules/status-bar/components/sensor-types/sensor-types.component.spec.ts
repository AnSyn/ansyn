import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTypesComponent } from './sensor-types.component';

describe('SensorTypesComponent', () => {
  let component: SensorTypesComponent;
  let fixture: ComponentFixture<SensorTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
