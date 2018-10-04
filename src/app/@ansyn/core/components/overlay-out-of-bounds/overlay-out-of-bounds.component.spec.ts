import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayOutOfBoundsComponent } from './overlay-out-of-bounds.component';

describe('OverlayOutOfBoundsComponent', () => {
  let component: OverlayOutOfBoundsComponent;
  let fixture: ComponentFixture<OverlayOutOfBoundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverlayOutOfBoundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayOutOfBoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
