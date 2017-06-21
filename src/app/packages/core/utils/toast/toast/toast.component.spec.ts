import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
	let component: ToastComponent;
	let fixture: ComponentFixture<ToastComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ToastComponent ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ToastComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
	describe('set showToast', ()=> {
		beforeEach(()=> {
			spyOn(window, 'setTimeout');
			spyOn(window, 'clearTimeout');
			spyOn(component.showToastChange, 'emit');
		});

		it('should: call showToastChange.emit with new value', () => {
			component.showToast = true;
			expect(component.showToastChange.emit).toHaveBeenCalledWith(true);
		});
		it('should: set Timeout if value is "true"', () => {
			component.showToast = false;
			expect(window.setTimeout).not.toHaveBeenCalled();
			component.showToast = true;
			expect(window.setTimeout).toHaveBeenCalled();
		});

		it('should: clear Timeout if value is "false"', () => {
			component.showToast = true;
			expect(window.clearTimeout).not.toHaveBeenCalled();
			component.showToast = false;
			expect(window.clearTimeout).toHaveBeenCalledWith(component.timeoutRef);
		});


		it('should: change _showToast value ', () => {
			component.showToast = true;
			expect((<any>component)._showToast).toBeTruthy();
			component.showToast = false;
			expect((<any>component)._showToast).toBeFalsy();
		});
	})

});
