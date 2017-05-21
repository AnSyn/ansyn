import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryStatusComponent } from './imagery-status.component';

describe('ImageryStatusComponent', () => {
  let component: ImageryStatusComponent;
  let fixture: ComponentFixture<ImageryStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageryStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageryStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
