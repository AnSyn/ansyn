import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoComponent } from './geo.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('GeoComponent', () => {
	let component: GeoComponent;
	let fixture: ComponentFixture<GeoComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [GeoComponent],
			imports: [FormsModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GeoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('onInputs should call onChanges with copy values', () => {
		spyOn(component, 'onChanges');
		component.onInputs(component.coordinates);
		expect(component.onChanges).toHaveBeenCalledWith(component.coordinates);
	});

	it("click on copy to clipboard", () => {
		spyOn(component, 'copyToClipBoard');
		const element = fixture.debugElement.query(By.css(".geo-copy-to-clipboard"));
		element.triggerEventHandler('click', {});
		expect(component.copyToClipBoard).toHaveBeenCalled();

	})

	describe('validate', () => {
		it('should return error if some of coordinates values is empty', () => {
			const fakeController: any = { value: [1, null] };
			let result = component.validate(fakeController);
			expect(result).toEqual({ empty: true });
		});

		it('should return check that lng between -180 to 180 and lat between -90 to 90', () => {
			const fakeController: any = { value: [-181, 0] };
			let result = component.validate(fakeController);
			expect(result).toEqual({ invalid: true });
			fakeController.value = [0, 91];
			result = component.validate(fakeController);
			expect(result).toEqual({ invalid: true });
		});
	});
});
