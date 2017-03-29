import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LayerTreeComponent } from './layer-tree.component';
import { TreeModule } from 'angular-tree-component';
import { DataLayersModule } from '../layers-manager.module';
describe('LayerTreeComponent', () => {
  let component: LayerTreeComponent;
  let fixture: ComponentFixture<LayerTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DataLayersModule],
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
