import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboBoxOptionComponent } from './combo-box-option.component';

describe('ComboBoxOptionComponent', () => {
	let component: ComboBoxOptionComponent;
	let fixture: ComponentFixture<ComboBoxOptionComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ComboBoxOptionComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ComboBoxOptionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
