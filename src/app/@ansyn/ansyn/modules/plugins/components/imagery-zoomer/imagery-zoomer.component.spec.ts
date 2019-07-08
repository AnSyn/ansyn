import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryZoomerComponent } from './imagery-zoomer.component';

describe('ImageryZoomerComponent', () => {
  let component: ImageryZoomerComponent;
  let fixture: ComponentFixture<ImageryZoomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageryZoomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageryZoomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
