import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerComponent } from './ansyn-date-picker.component';


describe('DatePickerComponent', () => {
	let component: DatePickerComponent;
	let fixture: ComponentFixture<DatePickerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DatePickerComponent],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DatePickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	// it('host binding should work', () => {
	// 	component.disabled = false;
	// 	fixture.detectChanges();
	// 	expect(fixture.elementRef.nativeElement.classList.contains('disabled')).toBe(false);
	// 	component.disabled = true;
	// 	fixture.detectChanges();
	// 	expect(fixture.elementRef.nativeElement.classList.contains('disabled')).toBe(true);
	// });
    //
	// it('check that disabled actully disabes the input and the function', () => {
	// 	const input = fixture.debugElement.query(By.css('input')).nativeElement;
	// 	spyOn(component, 'onInputClicked');
	// 	component.disabled = true;
	// 	fixture.detectChanges();
    //
	// 	input.click();
	// 	expect(input.checked).toBe(false);
	// 	expect(component.onInputClicked).not.toHaveBeenCalled();
	// 	component.disabled = false;
	// 	fixture.detectChanges();
    //
	// 	input.click();
	// 	expect(input.checked).toBe(true);
	// 	expect(component.onInputClicked).toHaveBeenCalled();
	// });
});

