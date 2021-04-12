import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacmanPopupComponent } from './pacman-popup.component';

describe('PacmanPopupComponent', () => {
	let component: PacmanPopupComponent;
	let fixture: ComponentFixture<PacmanPopupComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ PacmanPopupComponent ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PacmanPopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
