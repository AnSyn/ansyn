import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveCaseComponent } from './save-case.component';

describe('SaveCaseComponent', () => {
  let component: SaveCaseComponent;
  let fixture: ComponentFixture<SaveCaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveCaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
