import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendboxComponent } from './sendbox.component';

describe('SendboxComponent', () => {
	let component: SendboxComponent;
	let fixture: ComponentFixture<SendboxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SendboxComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SendboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
