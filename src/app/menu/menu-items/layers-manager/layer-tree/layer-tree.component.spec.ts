import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LayerTreeComponent } from './layer-tree.component';
import { TreeModule } from 'angular-tree-component';
import { LayersManagerModule } from '../layers-manager.module';
import { CoreModule } from '../../../core/core.module';

fdescribe('LayerTreeComponent', () => {
  let component: LayerTreeComponent;
  let fixture: ComponentFixture<LayerTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayersManagerModule, CoreModule],
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
