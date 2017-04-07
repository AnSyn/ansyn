import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LayersManagerModule } from '../layers-manager.module';
import { CoreModule } from '@ansyn/core/core.module';
import { LayersManagerComponent } from './layers-manager.component';

describe('LayersManagerComponent', () => {
  let component: LayersManagerComponent;
  let fixture: ComponentFixture<LayersManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayersManagerModule, CoreModule]
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
