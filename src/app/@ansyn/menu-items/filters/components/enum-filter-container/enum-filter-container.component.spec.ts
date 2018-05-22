import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SortPipe } from '../../pipes/sort.pipe';
import { MapIteratorPipe } from '../../pipes/map-iterator.pipe';
import { EnumFilterContainerComponent } from './enum-filter-container.component';
import { ShowMorePipe } from '@ansyn/menu-items/filters/pipes/show-more.pipe';
import { filtersConfig } from '@ansyn/menu-items/filters/services/filters.service';
import { FilterCounterComponent } from '@ansyn/menu-items/filters/components/filter-counter/filter-counter.component';

describe('EnumFilterContainerComponent', () => {
	let component: EnumFilterContainerComponent;
	let fixture: ComponentFixture<EnumFilterContainerComponent>;

	beforeEach(async(() => {
			TestBed.configureTestingModule({
				declarations: [EnumFilterContainerComponent, SortPipe, MapIteratorPipe, ShowMorePipe, FilterCounterComponent],
				providers: [{ provide: filtersConfig, useValue: {} }]
			}).compileComponents();
		}
	));

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
