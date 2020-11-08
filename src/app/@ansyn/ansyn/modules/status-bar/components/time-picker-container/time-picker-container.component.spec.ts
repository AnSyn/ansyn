import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimePickerContainerComponent } from './time-picker-container.component';

describe('TimePickerContainerComponent', () => {
  let component: TimePickerContainerComponent;
  let fixture: ComponentFixture<TimePickerContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimePickerContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimePickerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
