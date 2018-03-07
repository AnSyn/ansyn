import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtmComponent } from './utm.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('UtmComponent', () => {
	let component: UtmComponent;
	let fixture: ComponentFixture<UtmComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UtmComponent],
			imports: [FormsModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UtmComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});


	it('click on copy to clipboard', () => {
		spyOn(component, 'copyToClipBoard');
		const element = fixture.debugElement.query(By.css('.utm-copy-to-clipboard'));
		element.triggerEventHandler('click', {});
		expect(component.copyToClipBoard).toHaveBeenCalled();

	});

	it('validate should return error if some of coordinates values is empty', () => {
		const fakeController: any = { value: [1, 2, null] };
		let result = component.validate(fakeController);
		expect(result).toEqual({ empty: true });
		fakeController.value = [1, 2, 3];
		result = component.validate(fakeController);
		expect(result).toBeNull();
	});

});
