import { SliderFilterMetadata } from '../../models/metadata/slider-filter-metadata';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SliderFilterContainerComponent } from './slider-filter-container.component';
import { FormsModule } from '@angular/forms';
import { FilterCounterComponent } from '../filter-counter/filter-counter.component';
import { TranslateModule } from '@ngx-translate/core';

describe('SliderFilterContainerComponent', () => {
	let component: SliderFilterContainerComponent;
	let fixture: ComponentFixture<SliderFilterContainerComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [SliderFilterContainerComponent, FilterCounterComponent],
			imports: [
				FormsModule, TranslateModule.forRoot()
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
