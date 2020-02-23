import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtmWgsComponent } from './utm-wgs.component';
import { By } from "@angular/platform-browser";

describe('UtmWgsComponent', () => {
	let component: UtmWgsComponent;
	let fixture: ComponentFixture<UtmWgsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UtmWgsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UtmWgsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
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
