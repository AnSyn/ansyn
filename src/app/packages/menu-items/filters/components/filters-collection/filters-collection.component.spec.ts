import { StoreModule } from '@ngrx/store';
import { FiltersModule } from './../../filters.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersReducer } from '../../reducer/filters.reducer';
import { FiltersCollectionComponent } from './filters-collection.component';
import { filtersConfig } from '../../services/filters.service';

describe('FiltersCollectionComponent', () => {
  let component: FiltersCollectionComponent;
  let fixture: ComponentFixture<FiltersCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FiltersModule, StoreModule.provideStore({ filters: FiltersReducer })],
      providers: [{ provide: filtersConfig, useValue: { filters: null } }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
