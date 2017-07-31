import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtmComponent } from './utm.component';

describe('UtmComponent', () => {
  let component: UtmComponent;
  let fixture: ComponentFixture<UtmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
