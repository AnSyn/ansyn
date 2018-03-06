import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynCheckboxComponent } from './ansyn-date-picker.component';
import { By } from '@angular/platform-browser';


describe('AnsynCheckboxComponent', () => {
	let component: AnsynCheckboxComponent;
	let fixture: ComponentFixture<AnsynCheckboxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
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

	it('host binding should work', () => {
		component.disabled = false;
		fixture.detectChanges();
		expect(fixture.elementRef.nativeElement.classList.contains('disabled')).toBe(false);
		component.disabled = true;
		fixture.detectChanges();
		expect(fixture.elementRef.nativeElement.classList.contains('disabled')).toBe(true);
	});

	it('check that disabled actully disabes the input and the function', () => {
		const input = fixture.debugElement.query(By.css('input')).nativeElement;
		spyOn(component, 'onInputClicked');
		component.disabled = true;
		fixture.detectChanges();

		input.click();
		expect(input.checked).toBe(false);
		expect(component.onInputClicked).not.toHaveBeenCalled();
		component.disabled = false;
		fixture.detectChanges();

		input.click();
		expect(input.checked).toBe(true);
		expect(component.onInputClicked).toHaveBeenCalled();
	});


});

