import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtmHolderComponent } from './utm-holder.component';

describe('UtmHolderComponent', () => {
  let component: UtmHolderComponent;
  let fixture: ComponentFixture<UtmHolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtmHolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtmHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
