import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnumFilterContainerComponent } from './enum-filter-container.component';

describe('EnumFilterContainerComponent', () => {
  let component: EnumFilterContainerComponent;
  let fixture: ComponentFixture<EnumFilterContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnumFilterContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnumFilterContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
