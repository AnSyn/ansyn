import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPanelComponent } from './display-panel.component';

describe('DisplayPanelComponent', () => {
  let component: DisplayPanelComponent;
  let fixture: ComponentFixture<DisplayPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
