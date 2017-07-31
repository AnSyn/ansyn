import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoToComponent } from './go-to.component';

describe('GoToComponent', () => {
	let component: GoToComponent;
	let fixture: ComponentFixture<GoToComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ GoToComponent ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GoToComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('set expand should change _expand value and call expandChange.emit', () => {
		spyOn(component.expandChange, 'emit');
		component.expand = true;
		expect(component.expandChange.emit).toHaveBeenCalledWith(true);
		expect((<any>component)._expand).toBeTruthy();
		component.expand = false;
		expect(component.expandChange.emit).toHaveBeenCalledWith(false);
		expect((<any>component)._expand).toBeFalsy();
	});

});
