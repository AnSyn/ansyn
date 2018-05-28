import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboBoxesComponent } from './combo-boxes.component';

describe('ComboBoxesComponent', () => {
	let component: ComboBoxesComponent;
	let fixture: ComponentFixture<ComboBoxesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ComboBoxesComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ComboBoxesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
