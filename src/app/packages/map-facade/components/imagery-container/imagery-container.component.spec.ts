import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryContainerComponent } from './imagery-container.component';

describe('ImageryContainerComponent', () => {
  let component: ImageryContainerComponent;
  let fixture: ComponentFixture<ImageryContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageryContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageryContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
