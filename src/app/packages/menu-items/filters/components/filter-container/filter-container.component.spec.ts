import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { FiltersReducer } from '../../reducer/filters.reducer';
import { FiltersModule } from './../../filters.module';
import { FilterContainerComponent } from './filter-container.component';

describe('FilterContainerComponent', () => {
  let component: FilterContainerComponent;
  let fixture: ComponentFixture<FilterContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FiltersModule, StoreModule.provideStore({ filters: FiltersReducer })]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterContainerComponent);
    component = fixture.componentInstance;
    component.filter = {modelName: "string" ,displayName: "string", type: 'Enum'}
    fixture.detectChanges();
  });

  // it('should be created', () => {
  //   expect(component).toBeTruthy();
  // });
});
