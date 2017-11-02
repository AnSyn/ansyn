import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { StoreModule } from '@ngrx/store';
import { filtersFeatureKey, FiltersReducer } from '../../reducer/filters.reducer';
import { FiltersModule } from '../../filters.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SortPipe } from '../../pipes/sort.pipe';
import { MapIteratorPipe } from '../../pipes/map-iterator.pipe';
import { EnumFilterContainerComponent } from './enum-filter-container.component';

describe('EnumFilterContainerComponent', () => {
	let component: EnumFilterContainerComponent;
	let fixture: ComponentFixture<EnumFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EnumFilterContainerComponent, SortPipe, MapIteratorPipe]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EnumFilterContainerComponent);
		component = fixture.componentInstance;
		component.metadata = new EnumFilterMetadata();

		fixture.detectChanges();
	});

	it('should be created', () => {
	  expect(component).toBeTruthy();
	});
});
