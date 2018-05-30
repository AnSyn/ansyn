import { SliderFilterMetadata } from './../../models/metadata/slider-filter-metadata';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderFilterContainerComponent } from './slider-filter-container.component';
import { SliderModule } from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { FilterCounterComponent } from '@ansyn/menu-items/filters/components/filter-counter/filter-counter.component';

describe('SliderFilterContainerComponent', () => {
	let component: SliderFilterContainerComponent;
	let fixture: ComponentFixture<SliderFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SliderFilterContainerComponent, FilterCounterComponent],
			imports: [
				SliderModule, FormsModule
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SliderFilterContainerComponent);
		component = fixture.componentInstance;
		component.metadata = new SliderFilterMetadata();

		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
