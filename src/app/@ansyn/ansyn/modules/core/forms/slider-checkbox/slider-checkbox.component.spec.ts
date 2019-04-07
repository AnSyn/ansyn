import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderCheckboxComponent } from './slider-checkbox.component';

describe('SliderCheckboxComponent', () => {
	let component: SliderCheckboxComponent;
	let fixture: ComponentFixture<SliderCheckboxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SliderCheckboxComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SliderCheckboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
