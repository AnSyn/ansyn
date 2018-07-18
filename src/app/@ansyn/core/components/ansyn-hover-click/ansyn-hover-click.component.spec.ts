import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynHoverClickComponent } from './ansyn-hover-click.component';

describe('AnsynHoverClickComponent', () => {
	let component: AnsynHoverClickComponent;
	let fixture: ComponentFixture<AnsynHoverClickComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynHoverClickComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynHoverClickComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
