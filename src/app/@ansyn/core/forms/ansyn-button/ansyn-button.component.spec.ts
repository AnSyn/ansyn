import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynButtonComponent } from './ansyn-button.component';

describe('AnsynButtonComponent', () => {
	let component: AnsynButtonComponent;
	let fixture: ComponentFixture<AnsynButtonComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynButtonComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
