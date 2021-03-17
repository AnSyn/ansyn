import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnsynCheckboxComponent } from './ansyn-checkbox.component';
import { FormsModule } from '@angular/forms';


describe('AnsynCheckboxComponent', () => {
	let component: AnsynCheckboxComponent;
	let fixture: ComponentFixture<AnsynCheckboxComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [AnsynCheckboxComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynCheckboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

});

