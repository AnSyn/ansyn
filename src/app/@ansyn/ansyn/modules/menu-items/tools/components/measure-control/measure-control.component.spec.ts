import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureControlComponent } from './measure-control.component';

describe('MeasureControlComponent', () => {
	let component: MeasureControlComponent;
	let fixture: ComponentFixture<MeasureControlComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MeasureControlComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MeasureControlComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
