import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayStatusComponent } from './overlay-status.component';

describe('OverlayTimelineStatusComponent', () => {
  let component: OverlayStatusComponent;
  let fixture: ComponentFixture<OverlayStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverlayStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
