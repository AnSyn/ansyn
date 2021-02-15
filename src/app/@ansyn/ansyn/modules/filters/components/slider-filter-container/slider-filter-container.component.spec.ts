import { SliderFilterMetadata } from '../../models/metadata/slider-filter-metadata';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderFilterContainerComponent } from './slider-filter-container.component';
import { FormsModule } from '@angular/forms';
import { FilterCounterComponent } from '../filter-counter/filter-counter.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from '../../../core/test/mock-component';

describe('SliderFilterContainerComponent', () => {
	let component: SliderFilterContainerComponent;
	let fixture: ComponentFixture<SliderFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				SliderFilterContainerComponent,
				FilterCounterComponent,
				MockComponent({
					selector: 'ngx-slider',
					inputs: ['value', 'highValue', 'options']
				})
			],
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
