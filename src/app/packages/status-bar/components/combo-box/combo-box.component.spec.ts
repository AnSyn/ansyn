import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboBoxComponent } from './combo-box.component';

describe('ComboBoxComponent', () => {
	let component: ComboBoxComponent;
	let fixture: ComponentFixture<ComboBoxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ComboBoxComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ComboBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('toggleShow should toggle "visibility" of optionsContainer("visible" and "hidden"). on "visible" focus() should have been call too', (done) => {
		spyOn(component.optionsContainer.nativeElement, 'focus');
		component.optionsVisible = false;
		component.toggleShow();
		expect(component.optionsVisible).toEqual(true);

		component.optionsVisible = true;
		component.toggleShow();
		expect(component.optionsVisible).toEqual(false);

		setTimeout(() => {
			expect(component.optionsContainer.nativeElement.focus).toHaveBeenCalled();
			done();
		}, 0);
	});

	describe('onBlurOptionsContainer change "visibility" of optionsContainer to "hidden". only if relatedTarget is not "trigger" button', () => {
		it('not "trigger" button', () => {
			const $event = { relatedTarget: null } as any;
			component.optionsVisible = true;
			component.onBlurOptionsContainer($event);
			expect(component.optionsVisible).toEqual(false);
		});

		it('"trigger" button', () => {
			const $event: FocusEvent = { relatedTarget: component.optionsTrigger.nativeElement } as any;
			component.optionsVisible = true;
			component.onBlurOptionsContainer($event);
			expect(component.optionsVisible).toEqual(true);
		});
	});

	it('selectOption should get index, set the index on selected and change "visibility" of optionsContainer to "hidden".', () => {
		component.selectOption(1, 20);
		expect(component.selected).toEqual(20);
		expect(component.optionsContainer.nativeElement.style.visibility).toEqual('hidden');
	});
});
