import { SliderFilterMetadata } from './../../models/metadata/slider-filter-metadata';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderFilterContainerComponent } from './slider-filter-container.component';
import { SliderModule } from 'primeng/primeng';
import { FormsModule } from '@angular/forms';

describe('SliderFilterContainerComponent', () => {
	let component: SliderFilterContainerComponent;
	let fixture: ComponentFixture<SliderFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SliderFilterContainerComponent],
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
