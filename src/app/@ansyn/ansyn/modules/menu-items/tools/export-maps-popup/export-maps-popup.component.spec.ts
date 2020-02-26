import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportMapsPopupComponent } from './export-maps-popup.component';

describe('ExportMapsPopupComponent', () => {
  let component: ExportMapsPopupComponent;
  let fixture: ComponentFixture<ExportMapsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportMapsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportMapsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
