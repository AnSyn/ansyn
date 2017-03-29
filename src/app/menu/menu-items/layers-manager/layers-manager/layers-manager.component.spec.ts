import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LayerTreeComponent } from '../layer-tree/layer-tree.component';
import { LayersManagerComponent } from './layers-manager.component';

describe('LayersManagerComponent', () => {
  let component: LayersManagerComponent;
  let fixture: ComponentFixture<LayersManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayerTreeComponent],
      declarations: [LayersManagerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayersManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
