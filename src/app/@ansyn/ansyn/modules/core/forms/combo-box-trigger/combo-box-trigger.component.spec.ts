import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComboBoxTriggerComponent } from './combo-box-trigger.component';

describe('ComboBoxTriggerComponent', () => {
	let component: ComboBoxTriggerComponent;
	let fixture: ComponentFixture<ComboBoxTriggerComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ComboBoxTriggerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ComboBoxTriggerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
