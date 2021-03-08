import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayersSearchComponent } from './layers-search.component';

describe('LayersSearchComponent', () => {
  let component: LayersSearchComponent;
  let fixture: ComponentFixture<LayersSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayersSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayersSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
