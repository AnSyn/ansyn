import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerTreeComponent } from './layer-tree.component';

describe('LayerTreeComponent', () => {
  let component: LayerTreeComponent;
  let fixture: ComponentFixture<LayerTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
