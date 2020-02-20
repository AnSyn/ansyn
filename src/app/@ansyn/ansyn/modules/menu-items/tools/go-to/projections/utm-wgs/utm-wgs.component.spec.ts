import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtmWgsComponent } from './utm-wgs.component';

describe('UtmWgsComponent', () => {
  let component: UtmWgsComponent;
  let fixture: ComponentFixture<UtmWgsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtmWgsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtmWgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
